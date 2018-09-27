import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {MenuController, ToastController, Platform, NavController} from '@ionic/angular';

import {Subscription} from 'rxjs';

import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';

import {TranslateService} from '@ngx-translate/core';

// Pages
import {AbstractDeepLinkingNavigationPage} from '../../abstract-deep-linking-page-navigation';

// Utils
import FacebookToken = Facebook.FacebookToken;
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {AuthenticationService} from '../../../services/core/authentication/authentication-service';
import {UserSessionService} from '../../../services/core/user/user-session-service';
import {ItemsService} from '../../../services/browse/items-service';
import {ItemUsersService} from '../../../services/browse/item-users-service';
import {DeepLinkingService} from '../../../services/core/deeplinking/deep-linking-service';
import {LoginService} from '../../../services/core/login/login-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {CurrencyService} from '../../../services/core/currency/currency-service';
import {LikeService} from '../../../services/browse/like-service';
import {AppointmentService} from '../../../services/core/appointment/appointment-service';
import {NewItemService} from '../../../services/advertise/new-item-service';
import {NotificationWatcherService} from '../../../services/core/notification/notification-watcher-service';
import {ChatWatcherService} from '../../../services/core/notification/chat-watcher-service';
import {FacebookNativeService} from '../../../services/native/facebook/facebook-native-service';
import {StorageService} from '../../../services/core/localstorage/storage-service';
import {GoogleNativeService} from '../../../services/native/google/google-native-service';
import {PwaLoginState} from '../../../services/model/utils/pwa-login-state';
import {LoginNavParams, NavParamsService} from '../../../services/core/navigation/nav-params-service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss']
})
export class LoginPage extends AbstractDeepLinkingNavigationPage implements OnInit {

    notAuthorized: boolean = false;

    interacting: boolean = false;

    private loginInteractingSubscription: Subscription;

    constructor(protected navController: NavController,
                private menuController: MenuController,
                protected platform: Platform,
                protected toastController: ToastController,
                @Inject(DOCUMENT) private document: Document,
                protected splashScreen: SplashScreen,
                private inAppBrowser: InAppBrowser,
                protected translateService: TranslateService,
                protected authenticationService: AuthenticationService,
                protected userSessionService: UserSessionService,
                protected itemsService: ItemsService,
                protected itemUsersService: ItemUsersService,
                protected deepLinkingService: DeepLinkingService,
                protected loginService: LoginService,
                protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                protected currencyService: CurrencyService,
                protected likeService: LikeService,
                protected appointmentService: AppointmentService,
                protected notificationWatcherService: NotificationWatcherService,
                protected chatWatcherService: ChatWatcherService,
                public newItemService: NewItemService,
                protected facebookNativeService: FacebookNativeService,
                private storageService: StorageService,
                private googleNativeService: GoogleNativeService,
                protected navParamsService: NavParamsService) {
        super(navController, platform, toastController, splashScreen, translateService, userSessionService, itemsService, itemUsersService, deepLinkingService, loginService, likeService, appointmentService, googleAnalyticsNativeService, authenticationService, currencyService, notificationWatcherService, chatWatcherService, newItemService, facebookNativeService, navParamsService);
    }

    async ngOnInit() {
        // Authorized param is only use and set to 'false' when a bad not authorized http request was performed, see http-interceptor
        const loginNavParams: LoginNavParams = await this.navParamsService.getLoginNavParams();
        const authorizedParam: boolean = !Comparator.isEmpty(loginNavParams) ? loginNavParams.authorized : null;
        if (authorizedParam != null && !authorizedParam) {
            this.notAuthorized = true;
        }

        await this.enableMenu(this.menuController, false, false);

        this.loginInteractingSubscription = this.loginService.watchLoginInteracting().subscribe((loginInteracting: boolean) => {
            this.interacting = loginInteracting;
        });
    }

    ionViewWillEnter() {
        this.pwaLogin();

        this.init();
    }

    ionViewDidEnter() {
        this.hideSplashScreen(this.platform, this.splashScreen, this.loginService, false, false);
    }

    ionViewDidLeave() {
        if (this.loginInteractingSubscription != null) {
            this.loginInteractingSubscription.unsubscribe();
        }
    }

    private init() {
        this.interacting = this.loginService.isInteracting();

        if (this.interacting) {
            return;
        }

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.LOGIN);
    }

    private pwaLogin() {
        if (this.ENV_CORDOVA) {
            return;
        }

        const state: string = this.loginService.getState();
        const code: string = this.loginService.getCode();

        if (!Comparator.isStringEmpty(state) && !Comparator.isStringEmpty(code)) {
            this.loginService.setInteracting(true);

            this.storageService.retrieveLoginState().then((savedState: PwaLoginState) => {
                if (this.isValidPwaLoginState(state, savedState)) {
                    // PWA login from the app
                    this.doPwaLoginAndNavigate(savedState, code);
                } else {
                    const cookiePwaLoginState: PwaLoginState = this.getPwaLoginStateCookie();

                    if (this.isValidPwaLoginState(state, cookiePwaLoginState)) {
                        // PWA login from the website dialog
                        this.doPwaLoginAndNavigate(cookiePwaLoginState, code);
                    } else {
                        this.loginService.setInteracting(false);
                    }
                }

                this.setPwaLoginStateCookiedExpired();
                this.loginService.reset();
            });
        } else {
            this.setPwaLoginStateCookiedExpired();
            this.loginService.reset();
        }
    }

    private doPwaLoginAndNavigate(state: PwaLoginState, code: string) {
        this.doPwaLogin(state, code).then((hasAlreadySetParams: boolean) => {
            this.navigateLogin(hasAlreadySetParams);
        }, (errorResponse: any) => {
            this.displayError(errorResponse, state.googleAuth ? this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ERROR_LOGIN.GOOGLE_PWA_LOGIN : this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ERROR_LOGIN.FACEBOOK_PWA_LOGIN);
            this.loginService.setInteracting(false);
        });
    }

    private isValidPwaLoginState(state: string, savedState: PwaLoginState): boolean {
        return !Comparator.isEmpty(savedState) && !Comparator.isStringEmpty(savedState.state) && Comparator.equals(savedState.state, state);
    }

    private getPwaLoginStateCookie(): PwaLoginState {
        if (Comparator.isEmpty(this.document.cookie)) {
            return null;
        }

        // Get name followed by anything except a semicolon
        const cookies: RegExpExecArray = RegExp('Fluster_state' + '[^;]+').exec(this.document.cookie);

        if (Comparator.isEmpty(cookies)) {
            return null;
        }

        // Return everything after the equal sign, or an empty string if the cookie name not found
        const cookie: string = decodeURIComponent(!!cookies ? cookies.toString().replace(/^[^=]+./, '') : '');

        if (Comparator.isEmpty(cookie) || cookie.indexOf('state') === -1 || cookie.indexOf('googleAuth') === -1) {
            return null;
        }

        return JSON.parse(cookie);
    }

    private doPwaLogin(state: PwaLoginState, code: string): Promise<{}> {
        if (state.googleAuth) {
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.LOGIN, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.LOGIN_GOOGLE_PWA_SUCCESS);

            return this.authenticationService.googlePWALogin(code);
        } else {
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.LOGIN, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.LOGIN_FB_PWA_SUCCESS);

            return this.authenticationService.facebookPWALogin(code);
        }
    }

    openTermsOfuser() {
        this.displayTermsOfuser(this.inAppBrowser);
    }

    //removeIf(production)
    mockupLoginDavid() {
        const authResponse: FacebookToken = {
            accessToken: '{{MOCKUP_LOGIN_TOKEN_DAVID}}',
            expiresIn: 7 * 24 * 60 * 60
        };

        this.loginService.setInteracting(true);

        this.facebookPeterParkerLogin(authResponse);
    }

    mockupLoginSam() {
        const authResponse: FacebookToken = {
            accessToken: '{{MOCKUP_LOGIN_TOKEN_SAM}}',
            expiresIn: 7 * 24 * 60 * 60
        };

        this.loginService.setInteracting(true);

        this.facebookPeterParkerLogin(authResponse);
    }

    mockupLoginSteve() {
        const authResponse: FacebookToken = {
            accessToken: '{{MOCKUP_LOGIN_TOKEN_STEVE}}',
            expiresIn: 7 * 24 * 60 * 60
        };

        this.loginService.setInteracting(true);

        this.facebookPeterParkerLogin(authResponse);
    }

    //endRemoveIf(production)

    googleSignIn() {
        this.loginService.setInteracting(true);

        this.googleNativeService.login(this.googleLoginSuccess, this.googleLoginError);
    }

    private googleLoginSuccess = (response: any) => {
        this.googlePeterParkerLogin(response, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.LOGIN_GOOGLE_SUCCESS);
    }

    private googleLoginError = (error: any) => {
        this.displayError(error, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ERROR_LOGIN.GOOGLE_LOGIN);
    }

}
