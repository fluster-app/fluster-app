import {ToastController, LoadingController, MenuController, Platform} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {environment} from '../../environments/environment';

import {forkJoin} from 'rxjs';

import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';

import {TranslateService} from '@ngx-translate/core';

import {SwiperOptions} from 'swiper';

// Model
import {Item} from '../services/model/item/item';
import {User} from '../services/model/user/user';

// Resources
import {Resources} from '../services/core/utils/resources';
import {Comparator} from '../services/core/utils/utils';
import {ItemsComparator} from '../services/core/utils/items-utils';

// Services
import {LoginService} from '../services/core/login/login-service';
import {GoogleAnalyticsNativeService} from '../services/native/analytics/google-analytics-native-service';
import {CurrencyService} from '../services/core/currency/currency-service';
import {UserProfileService} from '../services/core/user/user-profile-service';
import {UserSessionService} from '../services/core/user/user-session-service';

export abstract class AbstractPage {

    slideOptsProgressbar: SwiperOptions = {
        zoom: false,
        pagination: {
            el: '.swiper-pagination',
            type: 'custom',
            renderCustom: (swiper, current, total) => {
                return this.customProgressBar(current, total);
            }
        }
    };

    slideOptsOnlyExternal: SwiperOptions = {
        zoom: false,
        allowTouchMove: false
    };

    slideOptsProgressbarOnlyExternal: SwiperOptions = {
        zoom: false,
        pagination: {
            el: '.swiper-pagination',
            type: 'custom',
            renderCustom: (swiper, current, total) => {
                return this.customProgressBar(current, total);
            }
        },
        allowTouchMove: false
    };

    isAdDisplay: boolean = false;

    RESOURCES: any = Resources.Constants;

    ENV_CORDOVA: boolean = environment.cordova;

    pwaShowShare: boolean = false;
    pwaShareOptions: any;

    constructor() {

    }

    protected hideSplashScreen(platform: Platform, splashScreen: SplashScreen, loginService: LoginService, removePwaCookie: boolean = true, stopLoginInteracting: boolean = true) {
        if (stopLoginInteracting) {
            loginService.setInteracting(false);
        }

        if (platform.is('cordova')) {
            if (splashScreen) {
                setTimeout(() => {
                    splashScreen.hide();
                }, 100);
            }
        }

        if (!this.ENV_CORDOVA && removePwaCookie) {
            this.setPwaLoginStateCookiedExpired();
        }
    }

    protected setPwaLoginStateCookiedExpired() {
        if (Comparator.isEmpty(document.cookie)) {
            return;
        }

        const baseDomain = '.' + this.RESOURCES.LOGIN.PWA.DOMAIN;

        document.cookie = 'Fluster_state=; domain=' + baseDomain + '; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    protected async errorMsg(toastController: ToastController, translateService: TranslateService, msgKey: string) {
        const msg: string = translateService.instant(msgKey);

        const errorMsg: HTMLIonToastElement = await toastController.create({
            message: msg,
            duration: 3000,
            position: 'middle',
            cssClass: 'fluster-toast'
        });

        await errorMsg.present();
    }

    protected shareItem(platform: Platform, socialSharing: SocialSharing, googleAnalyticsNativeService: GoogleAnalyticsNativeService, loadingController: LoadingController, translateService: TranslateService, currencyService: CurrencyService, item: Item): Promise<{}> {
        return new Promise((resolve, reject) => {

            this.gaTrackEvent(platform, googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.SHARE, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.SHARE_CALLED);

            const promises = new Array();
            promises.push(translateService.get(Comparator.equals(this.RESOURCES.ITEM.TYPE.SHARE, item.attributes.type) ? 'SELECT_ATTRIBUTES.SHARED_ROOMS' : 'SELECT_ATTRIBUTES.ROOMS'));
            promises.push(translateService.get('CORE.SQUARE_METER'));
            promises.push(translateService.get(ItemsComparator.isItemShare(item) ? 'ITEM_DETAILS.SHARE.SHARE_TEXT_SHARE' : 'ITEM_DETAILS.SHARE.SHARE_TEXT_FLAT'));

            forkJoin(promises).subscribe(
                (data: string[]) => {
                    if (!Comparator.isEmpty(data) && data.length === promises.length) {
                        const sharedUrl: string = this.RESOURCES.SOCIAL_SHARING.ITEM_URL + item.hashId;
                        const sharedImgUrl: string = this.RESOURCES.AWS.S3_URL + '/' + item.source + '/' + item.hashId + '/' + item.mainPhoto;

                        // Email title
                        const title: string = this.buildShareTitle(currencyService, data, item);

                        const msg: string = data[2];

                        this.share(socialSharing, msg, title, sharedImgUrl, sharedUrl).then(() => {
                            resolve();
                        }, () => {
                            reject();
                        });
                    }
                }
            );
        });
    }

    share(socialSharing: SocialSharing, msg: string, title: string, sharedImgUrl: string, sharedUrl: string): Promise<{}> {
        return new Promise((resolve, reject) => {
            if (this.ENV_CORDOVA) {
                this.shareCordova(socialSharing, msg, title, sharedImgUrl, sharedUrl).then(() => {
                    resolve();
                }, () => {
                    reject();
                });
            } else {
                this.sharePWA(title, sharedUrl).then(() => {
                    resolve();
                });
            }
        });
    }

    private shareCordova(socialSharing: SocialSharing, msg: string, title: string, sharedImgUrl: string, sharedUrl: string): Promise<{}> {
        return new Promise((resolve, reject) => {
            socialSharing.share(msg, title, sharedImgUrl, sharedUrl).then((result: boolean) => {
                resolve();
            }, (errorMsg: string) => {
                reject();
            });
        });
    }

    private sharePWA(title: string, sharedUrl: string): Promise<{}> {
        return new Promise((resolve) => {
            this.pwaShareOptions = {
                config: [{
                    facebook: {
                        socialShareUrl: sharedUrl
                    }
                }, {
                    twitter: {
                        socialShareUrl: sharedUrl
                    }
                }, {
                    linkedin: {
                        socialShareUrl: sharedUrl
                    }
                }, {
                    email: {
                        socialShareBody: sharedUrl,
                        socialShareSubject: title
                    }
                }]
            };

            this.pwaShowShare = true;

            resolve();
        });
    }

    sharePWAClose() {
        this.pwaShowShare = false;
    }

    private buildShareTitle(currencyService: CurrencyService, data: any, item: Item): string {
        // Email title
        let title: string = '';
        if (Comparator.equals(this.RESOURCES.ITEM.TYPE.SHARE, item.attributes.type)) {
            title += '' + item.attributes.sharedRooms + ' ' + data[0];
        } else {
            if (item.attributes.rooms > 0) {
                title += '' + item.attributes.rooms + ' ' + data[0];
            }

            if (item.attributes.size > 0) {
                title += ' ' + item.attributes.size + data[1];
            }
        }

        title += ' ' + currencyService.transformToLocaleString(item.attributes.price.gross);

        return title;
    }

    protected async enableMenu(menuController: MenuController, menuBrowse: boolean, menuAdvertise: boolean) {
        await menuController.enable(menuBrowse, 'menuBrowse');
        await menuController.enable(menuAdvertise, 'menuAdvertise');
    }

    protected gaTrackView(platform: Platform, googleAnalyticsNativeService: GoogleAnalyticsNativeService, viewName: string) {
        platform.ready().then(() => {
            googleAnalyticsNativeService.trackView(viewName);
        });
    }

    protected gaTrackEvent(platform: Platform, googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                           category: string, action: string) {
        platform.ready().then(() => {
            googleAnalyticsNativeService.trackEvent(category, action);
        });
    }

    protected displayTermsOfuser(inAppBrowser: InAppBrowser) {
        inAppBrowser.create(this.RESOURCES.TERMS_OF_USE.URL, '_blank', 'location=no');
    }

    protected async saveUserIfNeeded(toastController: ToastController, loadingController: LoadingController, translateService: TranslateService, userProfileService: UserProfileService, userSessionService: UserSessionService, user: User) {
        if (userSessionService.shouldUserBeSaved()) {
            await this.saveModifiedUser(toastController, loadingController, translateService, userProfileService, user);
        }
    }

    private async saveModifiedUser(toastController: ToastController, loadingController: LoadingController, translateService: TranslateService, userProfileService: UserProfileService, user: User) {
        const loading: HTMLIonLoadingElement = await loadingController.create({
            duration: 500
        });

        loading.present().then(() => {
            userProfileService.saveIfModified(user).then((updatedUser: User) => {
                if (!Comparator.isEmpty(updatedUser)) {
                    user = updatedUser;
                }
            }, async (response: HttpErrorResponse) => {
                await this.errorMsg(toastController, translateService, 'ERRORS.USER.SAVE_ERROR');
            });
        });
    }

    // Cool hack ;)
    // https://github.com/ionic-team/ionic/issues/14984
    private customProgressBar(current: number, total: number): string {
        const ratio: number = current / total;

        const progressBarStyle: string = 'style=\'transform: translate3d(0px, 0px, 0px) scaleX(' + ratio + ') scaleY(1); transition-duration: 300ms;\'';
        const progressBar: string = '<span class=\'swiper-pagination-progressbar-fill\' ' + progressBarStyle + '></span>';

        let progressBarContainer: string = '<div class=\'swiper-pagination-progressbar\' style=\'height: 4px; top: 6px; width: 100%;\'>';
        progressBarContainer += progressBar;
        progressBarContainer += '</span></div>';

        return progressBarContainer;
    }
}
