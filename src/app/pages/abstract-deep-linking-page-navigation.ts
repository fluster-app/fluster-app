import {HttpErrorResponse} from '@angular/common/http';
import {Platform, ToastController, NavController} from '@ionic/angular';

import {environment} from '../../environments/environment';

import {forkJoin} from 'rxjs';

import {SplashScreen} from '@ionic-native/splash-screen/ngx';

import {TranslateService} from '@ngx-translate/core';

import * as Raven from 'raven-js';

// Pages
import {AbstractPage} from './abstract-page';

// Model
import {Item} from '../services/model/item/item';
import {ItemUser} from '../services/model/item/item-user';
import {AccessToken, User} from '../services/model/user/user';
import {Applicant} from '../services/model/appointment/applicant';
import {Notification} from '../services/model/notification/notification';

// Resources and utils
import {Comparator} from '../services/core/utils/utils';
import FacebookToken = Facebook.FacebookToken;

// Services
import {UserSessionService} from '../services/core/user/user-session-service';
import {ItemsService} from '../services/browse/items-service';
import {ItemUsersService} from '../services/browse/item-users-service';
import {DeepLinkingService} from '../services/core/deeplinking/deep-linking-service';
import {LoginService} from '../services/core/login/login-service';
import {LikeService} from '../services/browse/like-service';
import {AppointmentService} from '../services/core/appointment/appointment-service';
import {GoogleAnalyticsNativeService} from '../services/native/analytics/google-analytics-native-service';
import {AuthenticationService} from '../services/core/authentication/authentication-service';
import {CurrencyService} from '../services/core/currency/currency-service';
import {NewItemService} from '../services/advertise/new-item-service';
import {NotificationWatcherService} from '../services/core/notification/notification-watcher-service';
import {ChatWatcherService} from '../services/core/notification/chat-watcher-service';
import {ChatMessage} from '../services/model/chat/chat';
import {FacebookNativeService} from '../services/native/facebook/facebook-native-service';
import {NavParamsService} from '../services/core/navigation/nav-params-service';

export abstract class AbstractDeepLinkingNavigationPage extends AbstractPage {

    constructor(protected navController: NavController,
                protected platform: Platform,
                protected toastController: ToastController,
                protected splashScreen: SplashScreen,
                protected translateService: TranslateService,
                protected userSessionService: UserSessionService,
                protected itemsService: ItemsService,
                protected itemUsersService: ItemUsersService,
                protected deepLinkingService: DeepLinkingService,
                protected loginService: LoginService,
                protected likeService: LikeService,
                protected appointmentService: AppointmentService,
                protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                protected authenticationService: AuthenticationService,
                protected currencyService: CurrencyService,
                protected notificationWatcherService: NotificationWatcherService,
                protected chatWatcherService: ChatWatcherService,
                public newItemService: NewItemService,
                protected facebookNativeService: FacebookNativeService,
                protected navParamsService: NavParamsService) {
        super();
    }

    // Standard login

    facebookSignIn() {
        this.loginService.setInteracting(true);

        this.facebookNativeService.getLoginStatus().then((success: any) => {
            if (success.status === 'connected') {
                // The user is logged in and has authenticated your app, and response.authResponse supplies
                // the user's ID, a valid access token, a signed request, and the time the access token
                // and signed request each expire
                const authResponse: FacebookToken = success.authResponse;

                this.facebookPeterParkerLogin(authResponse);
            } else {
                // If (success.status === 'not_authorized') the user is logged in to Facebook,
                // but has not authenticated your app
                // Else the person is not logged into Facebook,
                // so we're not sure if they are logged into this app or not.

                this.facebookNativeService.login(this.fbLoginSuccess, this.fbLoginError);
            }
        }, (error) => {
            this.displayError(error, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ERROR_LOGIN.FACEBOOK_STATUS_LOGIN);
        });
    }

    /**
     * Perform login with facebook authentication on the server (Peter Parker)
     * @param authResponse
     */
    protected facebookPeterParkerLogin(authResponse: any) {

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.LOGIN, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.LOGIN_FB_SUCCESS);

        const iOS: boolean = this.platform.is('cordova') && this.platform.is('ios');
        const android: boolean = this.platform.is('cordova') && this.platform.is('android');

        this.authenticationService.facebookMobileLogin(authResponse, iOS, android).then((hasAlreadySetParams: boolean) => {
            this.navigateLogin(hasAlreadySetParams);
        }, (errorResponse: any) => {
            this.displayError(errorResponse, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ERROR_LOGIN.PETERPARKER_LOGIN);
        });
    }

    /**
     * Perform login with google authentication on the server (Peter Parker)
     * @param profileInfo
     * @param authResponse
     */
    protected googlePeterParkerLogin(authResponse: any, gaEventName: string) {

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.LOGIN, gaEventName);

        this.authenticationService.googleLogin(authResponse, this.platform.is('ios'), this.platform.is('android')).then((hasAlreadySetParams: boolean) => {
            this.navigateLogin(hasAlreadySetParams);
        }, (errorResponse: any) => {
            this.displayError(errorResponse, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ERROR_LOGIN.PETERPARKER_LOGIN);
        });
    }

    /**
     * Perform login with the current token authentication on the server (Peter Parker)
     * @param accessToken
     */
    peterparkerLogin(accessToken: AccessToken): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.authenticationService.peterparkerLogin(accessToken, this.platform.is('ios'), this.platform.is('android')).then((hasAlreadySetParams: boolean) => {
                resolve(hasAlreadySetParams);
            }, (errorResponse: any) => {
                reject(errorResponse);
            });
        });
    }

    protected navigateLogin(hasAlreadySetParams: boolean) {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.LOGIN, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.LOGIN_FLUSTER_SUCCESS);

        // If user already set once the params and these were save in PP, go to items directly
        if (hasAlreadySetParams) {
            this.navigateAndHandleDeeplinking();
        } else {
            this.navController.navigateRoot('/first-choice').then(() => {
                // Do nothing
            });
        }
    }

    // This is the fail callback from the login method
    protected displayError(error: any, gaEventName: string) {
        this.hideSplashScreen(this.platform, this.splashScreen, this.loginService);

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.LOGIN, gaEventName);

        //removeIf(production)
        if (environment.production) {
            //endRemoveIf(production)
            Raven.captureException(error);
            //removeIf(production)
        }
        //endRemoveIf(production)

        this.errorMsg(this.toastController, this.translateService, 'ERRORS.LOGIN.LOGIN_ERROR').then(() => {
            // Do nothing
        });
    }

    private fbLoginSuccess = (response: any) => {
        if (!response.authResponse) {
            this.displayError('Cannot find the authResponse', this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ERROR_LOGIN.NO_RESPONSE_CONTENT);
            return;
        }

        const authResponse: FacebookToken = response.authResponse;

        this.facebookPeterParkerLogin(authResponse);
    };

    private fbLoginError = (error: any) => {
        this.displayError(error, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ERROR_LOGIN.FACEBOOK_LOGIN);
    };

    protected navigateAndHandleDeeplinking() {
        const user: User = this.userSessionService.getUser();

        const promises = new Array();

        promises.push(this.notificationWatcherService.initNotifications());
        promises.push(this.chatWatcherService.initNewMessages());
        promises.push(this.currencyService.initDefaultCurrency(user.userParams.address.country));

        forkJoin(promises).subscribe((data: any) => {

                const deepLinkingItemId: string = this.deepLinkingService.getItemHashId();

                if (!Comparator.isStringEmpty(deepLinkingItemId)) {
                    this.handleDeepLinking();
                } else {
                    const notifications: Notification[] = Comparator.hasElements(data) ? data[0] : new Array();
                    const chatMessages: ChatMessage[] = Comparator.hasElements(data) && data.length > 1 ? data[1] : new Array();

                    if (user.userParams.appSettings.browsing) {
                        this.navigateBrowse(notifications, chatMessages);
                    } else {
                        this.navigateAds(notifications, chatMessages);
                    }
                }
            }
        );
    }

    private navigateAds(notifications: Notification[], chatMessages: ChatMessage[]) {
        if (this.newItemService.hasPendingAndroidPhotoRecoveryURI()) {
            // There was a restart on Android because of low memory
            this.newItemService.recover().then(() => {
                this.navParamsService.setNewAdNavParams({
                    backToPageUrl: '/first-choice'
                });

                this.navController.navigateRoot('/new-ad').then(() => {
                    // Do nothing
                });
            }, (err: string) => {
                this.doNavigateAds(notifications, chatMessages);
            });
        } else {
            this.doNavigateAds(notifications, chatMessages);
        }
    }

    private doNavigateAds(notifications: Notification[], chatMessages: ChatMessage[]) {
        this.navigate(notifications, chatMessages, '/ads-next-appointments');
    }

    private navigateBrowse(notifications: Notification[], chatMessages: ChatMessage[]) {
        this.navigate(notifications, chatMessages, '/items');
    }

    private navigate(notifications: Notification[], chatMessages: ChatMessage[], withoutNotificationPage: string) {
        if (Comparator.hasElements(notifications)) {
            // We go where the first (createAt sort asc) unread notifications is
            if (Comparator.equals(this.RESOURCES.NOTIFICATION.TYPE.APPLICATION_NEW, notifications[0].type)) {
                this.navigateCheckAndSetUserSide(false, '/applicants');
            } else {
                this.navigateCheckAndSetUserSide(true, '/my-appointments-items');
            }
        } else if (Comparator.hasElements(chatMessages)) {
            const user: User = this.userSessionService.getUser();
            // userItem not populated
            if (Comparator.equals(chatMessages[0].chat.userItem, user._id)) {
                this.navigateCheckAndSetUserSide(false, '/applicants');
            } else {
                this.navigateCheckAndSetUserSide(true, '/my-appointments-items');
            }
        } else {
            this.navController.navigateRoot(withoutNotificationPage).then(() => {
                // Do nothing
            });
        }

        this.userSessionService.sessionInitialized = true;
    }

    private navigateCheckAndSetUserSide(browse: boolean, withNotificationPage: string) {
        this.checkAndSetUserSide(browse);
        this.navController.navigateRoot(withNotificationPage).then(() => {
            // Do nothing
        });
    }

    private checkAndSetUserSide(browse: boolean) {
        // Some user switch side, like people browsing and going into ads side after having sent requests

        const user: User = this.userSessionService.getUser();

        if (user.userParams.appSettings.browsing === browse) {
            // If correct, do nothing
            return;
        }

        user.userParams.appSettings.browsing = browse;

        this.userSessionService.setUserToSave(user);
    }

    // Deep Linking

    handleDeepLinking() {
        const itemHashId: string = this.deepLinkingService.getItemHashId();

        this.itemsService.findItem(itemHashId).then((result: Item) => {
            if (Comparator.isEmpty(result)) {
                this.errorAndNavigateToItems();
            } else {
                this.loadItemUser(result);
            }
        }, (errorResponse: HttpErrorResponse) => {
            this.errorAndNavigateToItems();
        });
    }

    private loadItemUser(item: Item) {

        const promises = new Array();

        promises.push(this.itemUsersService.findItemUser(item));
        promises.push(this.likeService.getLikeDislike(item.hashId, true));
        promises.push(this.likeService.getLikeDislike(item.hashId, false));
        promises.push(this.appointmentService.getDeeplinkApplicant(item._id));

        forkJoin(promises).subscribe(
            (data: any[]) => {
                const itemUser: ItemUser = data[0];
                const like: Communication.LikeStatus = data[1];
                const dislike: Communication.LikeStatus = data[2];
                const applicant: Applicant = data[3];

                this.navigateToItemDetail(item, itemUser, like, dislike, applicant);
            },
            (err: any) => {
                this.navigateToItemDetail(item, null, null, null, null);
            }
        );
    }

    // Navigate without back history
    private navigateToItemDetail(item: Item, itemUser: ItemUser, like: Communication.LikeStatus, dislike: Communication.LikeStatus, applicant: Applicant) {
        // In case the app was close before
        this.hideSplashScreen(this.platform, this.splashScreen, this.loginService);

        this.navParamsService.setItemDetailsNavParams({
            item: item,
            itemUser: itemUser,
            bookmarked: like != null && like.status,
            disliked: dislike != null && dislike.status,
            applicant: applicant,
            deeplink: true
        });

        this.navController.navigateRoot('/item-details').then(() => {
            // Do nothing
        });

        this.userSessionService.sessionInitialized = true;
    }

    private errorAndNavigateToItems() {
        this.errorMsg(this.toastController, this.translateService, 'ERRORS.DEEP_LINKING.NOT_FOUND').then(() => {
            // Do nothing
        });

        this.hideSplashScreen(this.platform, this.splashScreen, this.loginService);

        this.navController.navigateRoot('/items').then(() => {
            // Do nothing
        });

        this.userSessionService.sessionInitialized = true;
    }

}
