import {Component, ViewChild} from '@angular/core';
import {LoadingController, NavController, Platform, Slides, ToastController} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {SplashScreen} from '@ionic-native/splash-screen/ngx';

import {from} from 'rxjs';
import {timeout} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

// Pages
import {AbstractPage} from '../../abstract-page';

// Model
import {User, UserDescription} from '../../../services/model/user/user';
import {Address} from '../../../services/model/utils/address';
import {Location} from '../../../services/model/location/location';

// Resources and utils
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {UserSessionService} from '../../../services/core/user/user-session-service';
import {UserProfileService} from '../../../services/core/user/user-profile-service';
import {NewItemService} from '../../../services/advertise/new-item-service';
import {LoginService} from '../../../services/core/login/login-service';
import {CurrentLocationService} from '../../../services/core/location/current-location-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {CurrencyService} from '../../../services/core/currency/currency-service';
import {NavParamsService} from '../../../services/core/navigation/nav-params-service';

@Component({
    selector: 'app-first-choice',
    templateUrl: './first-choice.page.html',
    styleUrls: ['./first-choice.page.scss'],
})
export class FirstChoicePage extends AbstractPage {

    @ViewChild('firstChoiceSlider') slider: Slides;

    user: User;

    loading: HTMLIonLoadingElement;

    isAdSelected: boolean = false;
    isBrowseSelected: boolean = false;

    genderMaleSelected: boolean = false;
    genderFemaleSelected: boolean = false;
    genderUnknowSelected: boolean = false;

    firstSlide: boolean = true;

    constructor(private platform: Platform,
                private navController: NavController,
                private loadingController: LoadingController,
                private toastController: ToastController,
                private splashScreen: SplashScreen,
                private translateService: TranslateService,
                private userSessionService: UserSessionService,
                private userProfileService: UserProfileService,
                private loginService: LoginService,
                private currentLocationService: CurrentLocationService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private currencyService: CurrencyService,
                private newItemService: NewItemService,
                private navParamsService: NavParamsService) {
        super();

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.FIRST_CHOICE);
    }

    ionViewWillEnter() {
        this.hideSplashScreen(this.platform, this.splashScreen, this.loginService);
    }

    private initUser() {
        this.user = this.userSessionService.getUser();

        if (this.user.description == null) {
            this.user.description = new UserDescription();
        }

        if (Comparator.isEmpty(this.user.description.languages)) {
            this.user.description.languages = new Array();
            this.user.description.languages.push(this.translateService.currentLang);
        }

        this.userSessionService.setUser(this.user);
    }

    private async displayLoading(): Promise<void> {
        this.loading = await this.loadingController.create({});

        return this.loading.present();
    }

    browse() {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.FIRST_CHOICE, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.FIRST_CHOICE.BROWSE);

        this.pickBrowse();

        this.initUser();

        if (!this.isUserGoogle() || this.isGenderAlreadySet()) {
            // In case the gender is already set or in case of Facebook user, we don't want to ask for the gender here again
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.FIRST_CHOICE, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.FIRST_CHOICE.BROWSE_GENDER_GIVEN);

            this.setBrowseAndNavigate();
        } else {
            this.slider.slideNext();
            this.firstSlide = false;
        }
    }

    private isUserGoogle(): boolean {
        return !Comparator.isEmpty(this.user.google) && !Comparator.isStringEmpty(this.user.google.id);
    }

    private isGenderAlreadySet(): boolean {
        return !Comparator.isStringEmpty(this.user.facebook.gender) && (
            Comparator.equals(this.user.facebook.gender, this.RESOURCES.USER.GENDER.MALE) ||
            Comparator.equals(this.user.facebook.gender, this.RESOURCES.USER.GENDER.FEMALE));
    }

    browseMale() {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.FIRST_CHOICE, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.FIRST_CHOICE.BROWSE_MALE);

        this.genderMaleSelected = true;

        this.user.facebook.gender = this.RESOURCES.USER.GENDER.MALE;

        this.setBrowseAndNavigate();
    }

    browseFemale() {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.FIRST_CHOICE, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.FIRST_CHOICE.BROWSE_FEMALE);

        this.genderFemaleSelected = true;

        this.user.facebook.gender = this.RESOURCES.USER.GENDER.FEMALE;

        this.setBrowseAndNavigate();
    }

    browseUnknown() {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.FIRST_CHOICE, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.FIRST_CHOICE.BROWSE_UNKNOWN);

        this.genderUnknowSelected = true;

        this.user.facebook.gender = null;

        this.setBrowseAndNavigate();
    }

    private setBrowseAndNavigate() {
        this.displayLoading().then(() => {
            if (Comparator.equals(this.user.status, this.RESOURCES.USER.STATUS.INITIALIZED)) {
                this.initDefaultLocation().then(() => {
                    this.activateUserAndNavigate(this.loading, this.user, '/items');
                });
            } else {
                this.currencyService.initDefaultCurrency(this.user.userParams.address.country).then(() => {
                    this.navController.navigateRoot('/items').then(async () => {
                        await this.loading.dismiss();
                    });
                });
            }
        });
    }

    // Resolve true if address is or could had been initialized
    private initDefaultLocation(): Promise<{}> {
        return new Promise((resolve) => {
            if (!this.isAddressInitialized()) {
                // Finding current location. Max time we are ok to wait is 10sec, otherwise the user will have to pick a location by himself
                const findLocation = from(this.currentLocationService.findCurrentLocation());

                findLocation
                    .pipe(
                        timeout(this.RESOURCES.TIME_OUT.CURRENT_LOCATION)
                    )
                    .subscribe((currentLocation: Address) => {
                        this.updateUserParamsAddress(currentLocation);
                        resolve();
                    }, (err: string) => {
                        resolve();
                    });
            } else {
                resolve();
            }
        });
    }

    private isAddressInitialized(): boolean {
        // Per default, user address only contains location 0,0
        return !Comparator.isStringEmpty(this.user.userParams.address.addressName);
    }

    pickBrowse() {
        this.isBrowseSelected = true;
    }

    pickAd() {
        this.isAdSelected = true;
    }

    ads() {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.FIRST_CHOICE, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.FIRST_CHOICE.ADS);

        this.pickAd();

        this.displayLoading().then(() => {

            this.initUser();

            this.saveUserBrowsing(false);

            if (Comparator.equals(this.user.status, this.RESOURCES.USER.STATUS.INITIALIZED)) {
                // Prepare new item
                this.newItemService.init();

                // We go to the wizard
                this.navParamsService.setNewAdNavParams({
                    backToPageUrl: '/first-choice'
                });
                this.activateUserAndNavigate(this.loading, this.user, '/new-ad');
            } else {
                // We go to the dashboard
                this.navController.navigateRoot('/ads-next-appointments').then(async () => {
                    await this.loading.dismiss();
                });
            }
        });
    }

    private saveUserBrowsing(browse: boolean) {
        this.user.userParams.appSettings.browsing = browse;
        this.userSessionService.setUser(this.user);
    }

    private activateUserAndNavigate(loading: HTMLIonLoadingElement, user: User, page: string) {
        user.status = this.RESOURCES.USER.STATUS.ACTIVE;
        user.updatedAt = new Date();
        this.userSessionService.setUserToSave(this.user);

        this.userProfileService.saveIfModified(user).then((data: User) => {
            this.currencyService.initDefaultCurrency(user.userParams.address.country).then(() => {
                this.navController.navigateRoot(page).then(async () => {
                    if (loading) {
                        await loading.dismiss();
                    }
                });
            });
        }, async (response: HttpErrorResponse) => {
            if (loading) {
                await loading.dismiss();
            }

            await this.errorMsg(this.toastController, this.translateService, 'ERRORS.USER.SAVE_ERROR');
        });
    }

    private updateUserParamsAddress(currentLocation: Address) {
        const location: Location = new Location();
        location.lng = currentLocation.location.lng;
        location.lat = currentLocation.location.lat;

        this.user.userParams.address.location = location;

        // Default search location we display the city's name
        this.user.userParams.address.addressName = currentLocation.city;
        this.user.userParams.address.city = currentLocation.city;
        this.user.userParams.address.country = currentLocation.country;

        this.user.userParams.address.distance = this.RESOURCES.USER.ADDRESS.DEFAULT_DISTANCE;

        this.userSessionService.setUser(this.user);
    }


    backToPreviousSlide() {
        this.isBrowseSelected = false;

        this.slider.slidePrev();
        this.firstSlide = true;
    }

}
