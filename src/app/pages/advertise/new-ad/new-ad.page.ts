import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {LoadingController, MenuController, ModalController, NavController, Platform, Slides, ToastController} from '@ionic/angular';

import {HttpErrorResponse} from '@angular/common/http';

import {TranslateService} from '@ngx-translate/core';

// Pages
import {AbstractPage} from '../../abstract-page';

// Model
import {Item} from '../../../services/model/item/item';
import {User} from '../../../services/model/user/user';

// Resources and utils
import {ItemsComparator} from '../../../services/core/utils/items-utils';
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {NewItemService} from '../../../services/advertise/new-item-service';
import {AdsService} from '../../../services/advertise/ads-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {UserProfileService} from '../../../services/core/user/user-profile-service';
import {UserSessionService} from '../../../services/core/user/user-session-service';
import {NavParamsService, NewAdNavParams} from '../../../services/core/navigation/nav-params-service';

@Component({
    selector: 'app-new-ad',
    styleUrls: ['./new-ad.page.scss'],
    templateUrl: './new-ad.page.html'
})
export class NewAdPage extends AbstractPage implements OnInit {

    @ViewChild('newAdSlider') slider: Slides;

    private loading: HTMLIonLoadingElement;

    loadSlidePrice: boolean = false;
    loadSlideAttributes: boolean = false;
    loadSlideLifestyle: boolean = false;
    loadSlideAttendance: boolean = false;
    loadSlideDone: boolean = false;

    // Use to trigger the opening of the photo picker modal in case of android restart
    pendingAndroidPhoto: boolean = false;

    enteredAsDone: boolean = false;

    constructor(private navController: NavController,
                private menuController: MenuController,
                private platform: Platform,
                private loadingController: LoadingController,
                private toastController: ToastController,
                private modalController: ModalController,
                private translateService: TranslateService,
                private newItemService: NewItemService,
                private adsService: AdsService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private userProfileService: UserProfileService,
                private userSessionService: UserSessionService,
                private navParamsService: NavParamsService) {
        super();
    }

    async ngOnInit() {
        await this.initNavigation();
    }

    async ionViewWillEnter() {
        this.enteredAsDone = this.newItemService.isDone();
        this.loadSlideDone = this.enteredAsDone;
    }

    async ionViewDidEnter() {
        if (this.newItemService.hasPendingAndroidPhotoRecoveryURI()) {
            // There was a restart on Android because of low memory
            await this.slider.slideTo(this.newItemService.isEdit() ? 1 : 2, 0);
            this.pendingAndroidPhoto = true;
            return;
        }

        if (this.newItemService.isEdit()) {
            this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ADS.WIZARD.EDIT_AD);
        } else {
            this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ADS.WIZARD.NEW_AD);
        }
    }

    isEditMode(): boolean {
        return this.newItemService.isEdit();
    }

    @HostListener('document:ionBackButton', ['$event'])
    private overrideHardwareBackAction($event: any) {
        $event.detail.register(100, async () => {
            this.modalController.getTop().then(async (element: HTMLIonModalElement) => {
                // A modal might be open, in such a case we are closing it with the back button we don't need to navigate
                if (!element) {
                    await this.backToPreviousSlide();
                }
            });
        });
    }

    private async initNavigation() {
        // Disable menu
        await this.enableMenu(this.menuController, false, false);
    }

    async backToPreviousSlide() {
        const index: number = await this.slider.getActiveIndex();

        if (index > 0 && !this.newItemService.isDone()) {
            await this.slider.slidePrev();
        } else {
            const newAdNavParams: NewAdNavParams = await this.navParamsService.getNewAdNavParams();

            if (!newAdNavParams || Comparator.isStringEmpty(newAdNavParams.backToPageUrl) || newAdNavParams.backToPageUrl === '/first-choice') {
                await this.navController.navigateRoot('/ads-next-appointments');
            } else {
                await this.navController.navigateBack(newAdNavParams.backToPageUrl);
            }
        }
    }

    isItemShare() {
        const item: Item = this.newItemService.getNewItem();
        return ItemsComparator.isItemShare(item);
    }

    isItemFlat() {
        const item: Item = this.newItemService.getNewItem();
        return ItemsComparator.isItemFlat(item);
    }

    async publish() {
        this.loading = await this.loadingController.create({});

        if (this.newItemService.isEdit()) {
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.PUBLISH.UPDATE_CALLED);
        } else {
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.PUBLISH.PUBLISH_CALLED);
        }

        this.loading.present().then(() => {
            const user: User = this.userSessionService.getUser();

            this.userProfileService.saveIfModified(user).then((updatedUser: User) => {
                this.newItemService.saveNewItem().then(async () => {
                    // Save new item in actual session
                    this.adsService.setSelectedItem(this.newItemService.getNewItem());

                    await this.navigateToDone();
                }, (errorResponse: HttpErrorResponse) => {
                    this.displayPublishError(errorResponse);
                });
            }, (response: HttpErrorResponse) => {
                this.displayPublishError(response);
            });
        });
    }

    private displayPublishError(err: HttpErrorResponse) {
        this.loading.dismiss().then(async () => {
            await this.errorMsg(this.toastController, this.translateService, 'ERRORS.WIZARD.NOT_ADDED');

            this.gaTrackError();
        });
    }

    private gaTrackError() {
        if (this.newItemService.isEdit()) {
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.PUBLISH.UPDATE_ERROR);
        } else {
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.PUBLISH.PUBLISH_ERROR);
        }
    }

    private async navigateToDone() {
        await this.updateSlider();

        this.loading.dismiss().then(() => {
            this.slider.slideNext();

            if (this.newItemService.isEdit()) {
                this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.PUBLISH.UPDATE_DONE);
            } else {
                this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.PUBLISH.PUBLISH_DONE);
            }
        });
    }

    navigateToAdDetail() {
        this.navController.navigateRoot('/ads-details', true);
    }

    async navigateToAdminAppointments() {
        this.navigateToAdminSetBackPage();
        await this.navController.navigateRoot('/admin-appointments', true);
    }

    async navigateToAdminLimitation() {
        this.navigateToAdminSetBackPage();
        await this.navController.navigateRoot('/admin-limitation', true);
    }

    private navigateToAdminSetBackPage() {
        this.navParamsService.setAdminAdsNavParams({backToPageUrl: '/new-ad'});
    }

    // HACK: Fck it, Load incrementaly these steps for devices with small memory which could not handle a important load on load of the slides

    async loadNextSlidePrice() {
        this.loadSlidePrice = true;
        await this.updateSlider();
    }

    async loadNextSlideAttributes() {
        this.loadSlideAttributes = true;
        await this.updateSlider();
    }

    async loadNextSlidesFromPrice() {
        if (this.isItemFlat()) {
            this.loadSlideAttendance = true;
        } else {
            this.loadSlideLifestyle = true;
        }

        await this.updateSlider();
    }

    async loadNextSlideDone() {
        this.loadSlideDone = true;
        await this.updateSlider();
    }

    isDone(): boolean {
        return this.newItemService.isDone();
    }

    private async updateSlider() {
        // Slider need to be updated when slide are manually added or removed
        await this.slider.update();
    }

    async initAfterSliderLoad() {
        if (!this.slider) {
            return;
        }

        // Force the slider to stop, weird bug on iPad not using the configuration
        await this.slider.stopAutoplay();
    }
}
