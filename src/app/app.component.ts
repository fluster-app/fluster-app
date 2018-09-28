import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Config, LoadingController, MenuController, NavController, Platform, ToastController} from '@ionic/angular';

import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {Subscription} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import 'moment/locale/fr';
import 'moment/locale/de';
import 'moment/locale/it';

// Abstract
import {AbstractDeepLinkingNavigationPage} from './pages/abstract-deep-linking-page-navigation';

// Model and types
import {AccessToken, User} from './services/model/user/user';
import {DeeplinkMatch} from './services/types/branchio';
import {Item} from './services/model/item/item';

// Utils
import {Comparator} from './services/core/utils/utils';

// Services
import {UserSessionService} from './services/core/user/user-session-service';
import {StorageService} from './services/core/localstorage/storage-service';
import {ItemsService} from './services/browse/items-service';
import {ItemUsersService} from './services/browse/item-users-service';
import {DeepLinkingService} from './services/core/deeplinking/deep-linking-service';
import {LoginService} from './services/core/login/login-service';
import {UserProfileService} from './services/core/user/user-profile-service';
import {LikeService} from './services/browse/like-service';
import {AppointmentService} from './services/core/appointment/appointment-service';
import {GoogleAnalyticsNativeService} from './services/native/analytics/google-analytics-native-service';
import {AuthenticationService, LoginState} from './services/core/authentication/authentication-service';
import {CurrencyService} from './services/core/currency/currency-service';
import {NotificationWatcherService} from './services/core/notification/notification-watcher-service';
import {ChatWatcherService} from './services/core/notification/chat-watcher-service';
import {InterceptorRedirectService} from './services/core/http/interceptor-redirect-service';
import {SpotifyService} from './services/core/spotify/spotify-service';
import {NewItemService} from './services/advertise/new-item-service';
import {FacebookNativeService} from './services/native/facebook/facebook-native-service';
import {GoogleNativeService} from './services/native/google/google-native-service';
import {NavParamsService} from './services/core/navigation/nav-params-service';
import {AccessTokenService} from './services/core/user/access-token-service';

import 'hammerjs';

export interface MenuNavigation {
    title: string;
    url: string;
    displayNotifications: boolean;
}

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent extends AbstractDeepLinkingNavigationPage implements OnInit, OnDestroy, AfterViewInit {

    browsePages: MenuNavigation[];
    advertisePages: MenuNavigation[];

    user: User;

    userNotifierSubscription: Subscription;
    httpNotifierSubscription: Subscription;

    private authenticationSubscription: Subscription;
    private accessTokenSubscription: Subscription;

    private navigateSideInProgress: boolean = false;

    constructor(protected navController: NavController,
                private config: Config,
                protected platform: Platform,
                public menu: MenuController,
                public loadingController: LoadingController,
                protected toastController: ToastController,
                private statusBar: StatusBar,
                private zone: NgZone,
                protected splashScreen: SplashScreen,
                protected translateService: TranslateService,
                public userSessionService: UserSessionService,
                public storageService: StorageService,
                public itemsService: ItemsService,
                public itemUsersService: ItemUsersService,
                public deepLinkingService: DeepLinkingService,
                protected loginService: LoginService,
                private userProfileService: UserProfileService,
                protected likeService: LikeService,
                protected appointmentService: AppointmentService,
                protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                protected authenticationService: AuthenticationService,
                protected currencyService: CurrencyService,
                protected notificationWatcherService: NotificationWatcherService,
                protected chatWatcherService: ChatWatcherService,
                private interceptorRedirectService: InterceptorRedirectService,
                private spotifyService: SpotifyService,
                public newItemService: NewItemService,
                protected facebookNativeService: FacebookNativeService,
                private googleNativeService: GoogleNativeService,
                protected navParamsService: NavParamsService,
                private accessTokenService: AccessTokenService) {

        super(navController, platform, toastController, splashScreen, translateService, userSessionService, itemsService, itemUsersService, deepLinkingService, loginService, likeService, appointmentService, googleAnalyticsNativeService, authenticationService, currencyService, notificationWatcherService, chatWatcherService, newItemService, facebookNativeService, navParamsService);

        this.authenticationSubscription = this.authenticationService.watchLoginState().subscribe((loginState: LoginState) => {
            this.navToRoot(loginState);
        });

        platform.ready().then(() => {
            this.authenticationService.initLoginState();
        });

        this.browsePages = [
            {title: 'MENU.BROWSE.DISCOVER', url: '/items', displayNotifications: false},
            {title: 'MENU.BROWSE.MY_APPOINTMENTS', url: '/my-appointments-items', displayNotifications: true},
            {title: 'MENU.BROWSE.MY_BOOKMARKS', url: '/my-bookmarks-items', displayNotifications: false},
            {title: 'MENU.BROWSE.MY_APPLICANTS', url: '/my-applicants', displayNotifications: false}
        ];

        this.advertisePages = [
            {title: 'MENU.AD.MY_APPOINTMENTS', url: '/ads-next-appointments', displayNotifications: false},
            {title: 'MENU.AD.APPLICANTS', url: '/applicants', displayNotifications: true},
            {title: 'MENU.AD.MY_AD', url: '/ads-details', displayNotifications: false},
            {title: 'MENU.AD.CANDIDATES', url: '/candidates', displayNotifications: false}
        ];

        this.userNotifierSubscription = this.userSessionService.userModified.subscribe(() => this.updateUser());

        this.httpNotifierSubscription = this.interceptorRedirectService.requestIntercepted.subscribe((errorCode: number) => this.httpRequestIntercepted());

        this.accessTokenSubscription = this.accessTokenService.watchRedirect().subscribe((redirectPage: string) => {
            this.loginService.setInteracting(true);
            this.navigateToRoot(redirectPage);
        });

        const isAndroid: boolean = this.platform.is('android');

        if (isAndroid) {
            this.platform.resume.subscribe((event: CordovaResumeEvent) => {
                this.handleAndroidCameraRestart(event);
            });
        }
    }

    ngOnDestroy(): void {
        if (this.httpNotifierSubscription != null) {
            this.httpNotifierSubscription.unsubscribe();
        }

        if (this.userNotifierSubscription != null) {
            this.userNotifierSubscription.unsubscribe();
        }

        if (this.authenticationSubscription != null) {
            this.authenticationSubscription.unsubscribe();
        }

        if (this.accessTokenSubscription != null) {
            this.accessTokenSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.initializeTranslateServiceConfig();

        this.initializeFacebookPWA();

        this.initializeLoginStatePWAParams();
    }

    ngAfterViewInit() {
        this.initializeApp();
        this.initializeDeepLinking();
    }

    private initializeLoginStatePWAParams() {
        const state: string = this.platform.getQueryParam('state');
        const code: string = this.platform.getQueryParam('code');

        this.loginService.setState(state);
        this.loginService.setCode(code);
    }

    private initializeTranslateServiceConfig() {
        let userLang: string = this.translateService.getBrowserLang();
        userLang = /(de|en|fr|it)/gi.test(userLang) ? userLang : 'en';

        this.translateService.addLangs(['en', 'de', 'fr', 'it']);
        this.translateService.setDefaultLang('en');
        this.translateService.use(userLang);

        moment.locale(userLang);
    }

    private updateUser() {
        this.user = this.userSessionService.getUser();
    }

    // 400: bad request or 401: unauthorized should be forwarded to login mask
    // private
    httpRequestIntercepted() {
        this.storageService.clear().then(() => {
            this.navigateToLoginPage(false);
        }, (err: string) => {
            // In any case logout
            this.navigateToLoginPage(false);
        });
    }

    private async navigateToLoginPage(authorized: boolean) {
        this.navParamsService.setLoginNavParams({
            authorized: authorized
        });

        await this.navController.navigateRoot('/login');
    }

    initializeApp() {
        this.platform.ready().then(() => {
            if (this.ENV_CORDOVA && this.platform.is('cordova')) {
                // The first bar on the top when the time etc. are displayed. Otherwise theme-color of index.html will apply.
                const isAndroid: boolean = this.platform.is('android');
                if (isAndroid) {
                    this.statusBar.styleDefault();
                    this.statusBar.backgroundColorByHexString('#000000');
                } else {
                    this.statusBar.styleLightContent();
                }
            }
        });
    }

    private initializeDeepLinking() {
        this.platform.ready().then(() => {
            if (this.ENV_CORDOVA && this.platform.is('cordova')) {
                this.initializeDeepLinkingBranchio();

                this.initializeDeepLinkingURIScheme();
            } else {
                // The redirect is also provided by branch.io on desktop, on mobile we still go to the store
                const itemHashId = this.platform.getQueryParam('$itemId') || this.platform.getQueryParam('itemId') || this.platform.getQueryParam('%24itemId');

                this.deepLinkingService.setItemHashId(itemHashId);
            }
        });
    }

    private initializeDeepLinkingBranchio() {
        const branch = window['Branch'];

        if (branch) {
            // Deep link thru universal links
            branch.initSession().then((data: DeeplinkMatch) => {
                if (!Comparator.isStringEmpty(data.$marketing_title) &&
                    Comparator.equals(this.RESOURCES.DEEPLINK.MARKETING_TITLE.ITEM, data.$marketing_title) &&
                    !Comparator.isStringEmpty(data.$itemId)) {
                    this.doHandleDeepLinking(data.$itemId);
                }
            });
        }
    }

    // When app start with fluster://something
    // Handle URL scheme for Spotify connect too
    private initializeDeepLinkingURIScheme() {
        // https://github.com/EddyVerbruggen/Custom-URL-scheme/issues/227
        (window as any).handleOpenURL = (url: string) => {
            this.zone.run(() => {
                if (!Comparator.isStringEmpty(url)) {
                    if (url.indexOf(this.RESOURCES.SPOTIFY.REDIRECT_URL) > -1) {
                        const parsedUrl: URL = new URL(url);
                        const code = parsedUrl.searchParams.get('code');
                        const state = parsedUrl.searchParams.get('state');
                        const error = parsedUrl.searchParams.get('error');

                        this.spotifyService.setAuthenticationState(code, state, error);
                    } else if (url.indexOf(this.RESOURCES.DEEPLINK.URL_SCHEME.ITEM) > -1) {
                        const itemId: string = url.substring(url.lastIndexOf('/') + 1);

                        if (!Comparator.isStringEmpty(itemId)) {
                            this.doHandleDeepLinking(itemId);
                        }
                    }
                }
            });
        };
    }

    private doHandleDeepLinking(itemId: string) {
        this.deepLinkingService.setItemHashId(itemId);

        // Only if user is already logged
        if (this.userSessionService.sessionInitialized) {
            this.handleDeepLinking();
        }
    }

    openPage(page: MenuNavigation) {
        if (this.navigateSideInProgress) {
            return;
        }

        // close the menu when clicking a link from the menu
        this.menu.close();

        this.navigateToRoot(page.url);
    }

    private navigateToRoot(url: string) {
        this.navController.navigateRoot(url);
    }

    async navigateToBrowse() {
        if (this.navigateSideInProgress) {
            return;
        }

        this.navigateSideInProgress = true;

        await this.navigateSide(true, '/items');
    }

    async navigateToAds() {
        if (this.navigateSideInProgress) {
            return;
        }

        this.navigateSideInProgress = true;

        await this.navigateSide(false, '/ads-next-appointments');
    }

    private async navigateSide(browse: boolean, page: string) {
        this.user.userParams.appSettings.browsing = browse;
        this.user.updatedAt = new Date();
        this.userSessionService.setUserToSave(this.user);

        const loading: HTMLIonLoadingElement = await this.loadingController.create({});

        await loading.present();

        this.saveUser().then(async () => {
            this.navigateSideInProgress = false;

            await this.navController.navigateRoot(page);
            await this.menu.close();
            await loading.dismiss();
        }, async (response: HttpErrorResponse) => {
            await loading.dismiss();
            await this.errorMsg(this.toastController, this.translateService, 'ERRORS.USER.SAVE_ERROR');
        });
    }

    private async saveUser(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            this.userProfileService.saveIfModified(this.user).then(async (updatedUser: User) => {
                if (!Comparator.isEmpty(updatedUser)) {
                    this.user = updatedUser;
                }

                resolve();
            }, async (response: HttpErrorResponse) => {
                reject(response);
            });
        });
    }

    // Navigation

    private navToRoot(loginState: LoginState) {
        if (Comparator.equals(loginState.state, this.RESOURCES.LOGIN.STATE.TOKEN_EXPIRED)) {
            // Otherwise if error an empty screen gonna be displayed
            this.navController.navigateRoot('/login').then(() => {
                if (loginState.accessToken.googleAuth) {
                    this.googleTryAutomaticSignIn();
                } else {
                    this.facebookSignIn();
                }
            });
        } else if (Comparator.equals(loginState.state, this.RESOURCES.LOGIN.STATE.TOKEN_OK)) {
            this.automaticLoginWithPeterparker(loginState.accessToken);
        } else {
            this.navController.navigateRoot('/login').then(() => {
                // Do nothing
            });
        }
    }

    private automaticLoginWithPeterparker(accessToken: AccessToken) {
        if (!Comparator.isEmpty(accessToken)) {
            this.peterparkerLogin(accessToken).then((hasAlreadySetParams: boolean) => {
                this.navigateLogin(hasAlreadySetParams);
            }, (errorResponse: any) => {
                this.navController.navigateRoot('/login').then(() => {
                    this.displayError(errorResponse, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ERROR_LOGIN.AUTOMATIC_LOGIN);
                });
            });
        } else {
            this.navController.navigateRoot('/login').then(() => {
                // Do nothing
            });
        }
    }

    // Android camera hack / quirk
    // Did a restart on Android because of low memory happened after having use the camera?

    private handleAndroidCameraRestart(event: CordovaResumeEvent) {

        if (!Comparator.isEmpty(event) && !Comparator.isEmpty(event.pendingResult)) {

            const status: string = Comparator.isStringEmpty(event.pendingResult.pluginStatus) ? '' : event.pendingResult.pluginStatus.toUpperCase();

            if (Comparator.equals('Camera', event.pendingResult.pluginServiceName) && !Comparator.equals('OK', status) && !Comparator.isStringEmpty(event.pendingResult.result)) {
                this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.OTHER, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.OTHER.PHOTO_RECOVERY);

                this.newItemService.pushAndroidPhotoRecoveryURI(event.pendingResult.result);
            }
        }
    }

    private initializeFacebookPWA() {
        if (!this.ENV_CORDOVA) {
            // Window should find place here to be correctly initialized
            (<any> window).fbAsyncInit = () => {
                this.facebookNativeService.init();
            };
        }
    }

    private googleTryAutomaticSignIn() {
        if (this.ENV_CORDOVA) {
            this.loginService.setInteracting(true);

            this.googleNativeService.tryAutomaticLogin()
                .then(res => {
                    this.googlePeterParkerLogin(res, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.LOGIN_GOOGLE_SILENT_SUCCESS);
                }).catch((err: any) => {
                // Ignore error, automatic sign-in just didn't work
                this.hideSplashScreen(this.platform, this.splashScreen, this.loginService);

                this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.LOGIN, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ERROR_LOGIN.AUTOMATIC_GOOGLE_LOGIN);
            });
        } else {
            this.hideSplashScreen(this.platform, this.splashScreen, this.loginService);
        }
    }
}
