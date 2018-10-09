import {Component, Input, OnChanges, SimpleChange, AfterViewInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {ModalController, Platform} from '@ionic/angular';
import {SafeUrl, DomSanitizer} from '@angular/platform-browser';
import {HttpErrorResponse} from '@angular/common/http';

import {forkJoin, Subscription} from 'rxjs';

// Abstract
import {AbstractPage} from '../../../../pages/abstract-page';

// Modal
import {YelpBusinessDetailsModal} from '../../../../modals/core/yelp-business-details/yelp-business-details';

// Model
import {Item} from '../../../../services/model/item/item';
import {ItemUser} from '../../../../services/model/item/item-user';
import {User} from '../../../../services/model/user/user';
import {Applicant} from '../../../../services/model/appointment/applicant';

// Utils
import {Comparator} from '../../../../services/core/utils/utils';
import {Resources} from '../../../../services/core/utils/resources';
import {ItemsComparator} from '../../../../services/core/utils/items-utils';

// Service
import {YelpService} from '../../../../services/core/yelp/yelp-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {UserProfileService} from '../../../../services/core/user/user-profile-service';

@Component({
    templateUrl: 'item-details-content.html',
    styleUrls: ['./item-details-content.scss'],
    selector: 'app-item-details-content'
})
export class ItemDetailsContentComponent extends AbstractPage implements OnChanges, AfterViewInit, OnDestroy {

    RESOURCES: any = Resources.Constants;

    @Output() selectedCategory: EventEmitter<string> = new EventEmitter<string>();
    @Output() performAction: EventEmitter<{}> = new EventEmitter<{}>();

    @Input() item: Item;
    @Input() itemUser: ItemUser;
    @Input() applicant: Applicant;

    @Input() isAdDisplay: boolean = false;
    @Input() displaySensitive: boolean = false;

    @Input() noAppointmentAction: boolean = false;

    @Input() displayChat: boolean = true;

    yelpBusinesses: Yelp.YelpBusiness[];
    yelpInitializationStarted: boolean = false;

    externalMapUrl: string = null;

    category: string = 'who';

    advertiser: User;
    advertiserInitializationStarted: boolean = false;

    mapRefresher: number;

    advertiserLoaded: boolean = false;

    private watchSavedUser: Subscription;

    constructor(private platform: Platform,
                private modalController: ModalController,
                private sanitizer: DomSanitizer,
                private yelpService: YelpService,
                private userProfileService: UserProfileService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super();

        this.yelpBusinesses = null;
    }

    ngAfterViewInit(): void {

        this.category = this.getFirstCategory();

        this.loadData();

        this.initExternalMapUrl();

        this.watchSavedUser = this.userProfileService.watchSavedUser().subscribe(async (updateUser: User) => {
            // We only need to refresh the advertiser data on the ads side
            if (this.isAdDisplay) {
                this.advertiserInitializationStarted = false;
                await this.loadAdvertiserPublicProfile();
            }
        });
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (Comparator.isStringEmpty(this.category) || this.category === 'who') {
            this.category = this.getFirstCategory();
        }

        this.loadData();

        this.initExternalMapUrl();
    }

    ngOnDestroy() {
        if (this.watchSavedUser) {
            this.watchSavedUser.unsubscribe();
        }
    }

    getFirstCategory(): string {
        return this.isItemShare() ? 'who' : 'details';
    }

    private loadData() {
        const promises = new Array();

        promises.push(this.findYelpData());
        promises.push(this.loadAdvertiserPublicProfile());

        forkJoin(promises).subscribe(
            (data: any[]) => {
                // Do nothing
            },
            (err: any) => {
                // Do nothing
            }
        );
    }

    hasItemUser(): boolean {
        return this.itemUser != null && Comparator.hasElements(this.itemUser.interests);
    }

    isItemShare(): boolean {
        return ItemsComparator.isItemShare(this.item);
    }

    isItemFlat(): boolean {
        return ItemsComparator.isItemFlat(this.item);
    }

    isItemStarred(): boolean {
        return ItemsComparator.isItemStarred(this.item);
    }

    isLimitationsMale() {
        return !Comparator.isEmpty(this.item) && (Comparator.equals(this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.IRRELEVANT,
            this.item.userLimitations.gender) || Comparator.equals(this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.MALE,
            this.item.userLimitations.gender));
    }

    isLimitationsFemale() {
        return !Comparator.isEmpty(this.item) && (Comparator.equals(this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.IRRELEVANT,
            this.item.userLimitations.gender) || Comparator.equals(this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.FEMALE,
            this.item.userLimitations.gender));
    }

    isTagInternetSelected() {
        return !Comparator.isEmpty(this.item.itemDetail.tags) &&
            this.item.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.INTERNET) > -1;
    }

    isTagCleaningAgentSelected() {
        return !Comparator.isEmpty(this.item.itemDetail.tags) &&
            this.item.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.CLEANING_AGENT) > -1;
    }

    isTagBalconySelected() {
        return !Comparator.isEmpty(this.item.itemDetail.tags) &&
            this.item.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.BALCONY) > -1;
    }

    isTagGardenSelected() {
        return !Comparator.isEmpty(this.item.itemDetail.tags) &&
            this.item.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.GARDEN) > -1;
    }

    isParkingSelected() {
        return !Comparator.isEmpty(this.item.itemDetail.parking);
    }

    // Yelp

    private findYelpData(): Promise<{}> {
        return new Promise((resolve) => {
            if (this.item != null && !this.yelpInitializationStarted) {

                this.yelpInitializationStarted = true;

                this.yelpService.search(this.item.address.location).then((yelpBusinesses: Yelp.YelpBusiness[]) => {
                    this.yelpBusinesses = yelpBusinesses;
                    resolve();
                }, (errorStatusText: string) => {
                    this.yelpBusinesses = new Array();
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    hasYelpData(): boolean {
        return Comparator.hasElements(this.yelpBusinesses);
    }

    async openYelpModal(yelpBusiness: Yelp.YelpBusiness) {

        const modal: HTMLIonModalElement = await this.modalController.create({
            component: YelpBusinessDetailsModal,
            componentProps: {
                item: this.item,
                yelpBusiness: yelpBusiness,
                adDisplay: this.isAdDisplay
            }
        });

        modal.onDidDismiss().then(() => {
            this.mapRefresher = Math.random();
        });

        await modal.present();
    }

    private initExternalMapUrl() {
        if (Comparator.isEmpty(this.item)) {
            return;
        }

        let searchQuery: string = this.item.address.street != null ? (this.item.address.street + ',') : '';
        searchQuery += this.item.address.zip != null ? (this.item.address.zip + ',') : '';
        searchQuery += this.item.address.city;

        if (this.platform.is('android')) {
            this.externalMapUrl = 'geo://0,0?q=' + searchQuery;
        } else if (this.platform.is('ios')) {
            this.externalMapUrl = 'maps://?q=' + searchQuery;
        }
    }

    sanitize(url: string): SafeUrl {
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    userPerformAction(newCategory: string) {
        this.category = newCategory;

        this.performAction.emit();
    }

    segmentChange(newCategory: string) {
        this.category = newCategory;

        // In case who, we emit when everything is loaded
        if (!Comparator.equals(this.category, 'who')) {
            this.selectedCategory.emit(this.category);
        }

        if (Comparator.equals(this.category, 'details')) {
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService,
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ITEMS,
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ITEMS.SPECS);
        } else if (Comparator.equals(this.category, 'neighborhood')) {
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService,
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ITEMS,
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ITEMS.NEIGHBORHOOD);
        } else if (Comparator.equals(this.category, 'who')) {
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService,
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ITEMS,
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.BROWSE.ADVERTISER_DETAILS);
        } else if (Comparator.equals(this.category, 'chat')) {
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService,
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ITEMS,
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ITEMS.CHAT);
        }
    }

    // Public profile

    private loadAdvertiserPublicProfile(): Promise<{}> {
        return new Promise((resolve) => {
            if (this.item != null && !this.advertiserInitializationStarted) {
                this.advertiserInitializationStarted = true;
                this.advertiserLoaded = false;

                this.userProfileService.findPublicProfile(this.item.user._id).then((advertiserProfile: User) => {
                    this.advertiser = advertiserProfile;
                    this.advertiserLoaded = true;
                    resolve();
                }, (error: HttpErrorResponse) => {
                    this.advertiser = null;
                    this.advertiserLoaded = true;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    setUserProfileLoaded(value: boolean) {
        this.selectedCategory.emit(this.category);
    }
}
