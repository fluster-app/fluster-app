import {Component, Input, OnInit} from '@angular/core';
import {LoadingController, ModalController, Platform, PopoverController, ToastController} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';

import {TranslateService} from '@ngx-translate/core';

// Pages
import {AbstractItemsPage} from '../items/abstract-items';

// Modal
import {SearchLocationModal} from '../../../modals/core/search-location/search-location';

// Model
import {User, UserInterest} from '../../../services/model/user/user';
import {Location} from '../../../services/model/location/location';
import {Address} from '../../../services/model/utils/address';

// Resources and utils
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {UserSessionService} from '../../../services/core/user/user-session-service';
import {UserProfileService} from '../../../services/core/user/user-profile-service';
import {CurrencyService} from '../../../services/core/currency/currency-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {ItemUsersService} from '../../../services/browse/item-users-service';
import {SubscriptionService} from '../../../services/core/user/subscription-service';

@Component({
    selector: 'app-item-params',
    templateUrl: './item-params.page.html',
    styleUrls: ['./item-params.page.scss'],
})
export class ItemParamsPage extends AbstractItemsPage implements OnInit {

    @Input() user: User;

    private originalUser: User;

    category: string;

    price: number = this.RESOURCES.USER.ITEM.PRICE.MAX;

    availableNow: boolean;
    unlimited: boolean = true;

    distance: number = this.RESOURCES.USER.ADDRESS.DEFAULT_DISTANCE;

    private productModalActive: boolean = false;

    constructor(private platform: Platform,
                private loadingController: LoadingController,
                private toastController: ToastController,
                private modalController: ModalController,
                protected popoverController: PopoverController,
                private translateService: TranslateService,
                private userSessionService: UserSessionService,
                private userProfileService: UserProfileService,
                private currencyService: CurrencyService,
                protected itemUsersService: ItemUsersService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private subscriptionService: SubscriptionService) {
        super(popoverController, itemUsersService);

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ITEMS.ITEM_PARAMS);

    }

    ngOnInit() {
        this.category = 'location';
    }

    ionViewWillEnter() {
        this.user = this.userSessionService.getUser();

        this.originalUser = JSON.parse(JSON.stringify(this.user));

        this.initUserParams();
    }

    private initUserParams() {
        this.price = this.user.userParams.item.budget.max == null ? this.RESOURCES.USER.ITEM.PRICE.MAX : this.user.userParams.item.budget.max;

        this.availableNow = this.user.userParams.item.availability.begin == null;
        this.unlimited = this.user.userParams.item.availability.end == null;

        this.distance = this.user.userParams.address.distance == null ? this.RESOURCES.USER.ADDRESS.DEFAULT_DISTANCE : this.user.userParams.address.distance;
    }

    ionViewWillLeave() {
        if (!Comparator.equals(this.originalUser, this.user)) {
            // Will allow us to detect the modification to update the user
            this.userSessionService.setUserToSave(this.user);
        }
    }

    async ionViewDidLeave() {
        await this.saveUserIfNeeded(this.toastController, this.loadingController, this.translateService, this.userProfileService, this.userSessionService, this.user);
    }

    // Location

    async navigateToSearchLocation() {
        const modal: HTMLIonModalElement = await this.modalController.create({
            component: SearchLocationModal,
            componentProps: {
                adDisplay: false
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            if (detail && detail.data && detail.data.selectedLocation) {
                this.updateUserParamsAddress(detail.data.selectedLocation);
            }
        });

        await modal.present();
    }

    private updateUserParamsAddress(currentLocation: Address) {
        const location = new Location();
        location.lng = currentLocation.location.lng;
        location.lat = currentLocation.location.lat;

        this.user.userParams.address.location = location;

        this.user.userParams.address.addressName = currentLocation.addressName;
        this.user.userParams.address.city = currentLocation.city;
        this.user.userParams.address.country = currentLocation.country;

        this.userSessionService.setUser(this.user);

        if (this.user.userParams.address.distance == null) {
            this.user.userParams.address['distance'] = this.distance;
        }

        if (Comparator.equals(this.user.status, this.RESOURCES.USER.STATUS.INITIALIZED)) {
            this.user.status = this.RESOURCES.USER.STATUS.ACTIVE;
        }

        this.currencyService.initDefaultCurrency(currentLocation.country).then(() => {
            // Do nothing here
        });
    }

    isAddressNotDefined() {
        // Per default, user address only contains location 0,0
        return Comparator.isStringEmpty(this.user.userParams.address.addressName);
    }

    async onDistanceChange(ev: Range) {
        if (this.user.userParams.address.distance == null) {
            this.user.userParams.address['distance'] = this.distance;
        } else {
            this.user.userParams.address.distance = this.distance;
        }

        if (!this.productModalActive && this.distance !== this.RESOURCES.USER.ADDRESS.DEFAULT_DISTANCE && !this.subscriptionService.couldChangeDistance()) {
            const modal: HTMLIonPopoverElement = await this.getProductModal();

            modal.onDidDismiss().then((detail: OverlayEventDetail) => {
                if (!detail.data) {
                    this.user.userParams.address.distance = this.RESOURCES.USER.ADDRESS.DEFAULT_DISTANCE;
                    this.distance = this.RESOURCES.USER.ADDRESS.DEFAULT_DISTANCE;
                }

                this.productModalActive = false;
            });

            modal.present().then(() => {
                this.productModalActive = true;
            });
        }
    }

    // Price

    async onPriceChange(ev: Range) {
        this.user.userParams.item.budget.min = null;

        if (this.RESOURCES.USER.ITEM.PRICE.MAX === this.price || this.RESOURCES.USER.ITEM.PRICE.MIN === this.price) {
            this.user.userParams.item.budget.max = null;
        } else {
            this.user.userParams.item.budget.max = this.price;
        }

        if (!this.productModalActive && this.user.userParams.item.budget.max != null && !this.subscriptionService.couldChangeBudget()) {
            const modal: HTMLIonPopoverElement = await this.getProductModal();

            modal.onDidDismiss().then((detail: OverlayEventDetail) => {
                if (!detail.data) {
                    this.user.userParams.item.budget.max = null;
                    this.price = this.RESOURCES.USER.ITEM.PRICE.MAX;
                }

                this.productModalActive = false;
            });

            modal.present().then(() => {
                this.productModalActive = true;
            });
        }
    }

    hasPriceRange(): boolean {
        return this.price != null && this.price !== this.RESOURCES.USER.ITEM.PRICE.MAX;
    }

    // Interests

    private hasInterests(): boolean {
        return this.user.userParams.interests != null && !Comparator.isEmpty(this.user.userParams.interests.interests);
    }

    hasInterest(index: number): boolean {
        return this.hasInterests() && this.user.userParams.interests.interests.length >= index + 1;
    }

    getInterest(index: number): UserInterest {
        if (this.hasInterest(index)) {
            return this.user.userParams.interests.interests[index];
        } else {
            return null;
        }
    }

    updateUserInterest(interest: UserInterest, index: number) {
        // Do nothing. Since we pass this user as input of the component thru the modal,
        // as per pointer reference, this user gonna be in the modal updated with the new interests
    }


}
