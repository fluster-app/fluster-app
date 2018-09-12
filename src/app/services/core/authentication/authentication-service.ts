import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';
import {timeout} from 'rxjs/operators';
import {forkJoin} from 'rxjs';

// Model
import {AccessToken, UserAccess} from '../../model/user/user';

// Resources and utils
import {Resources} from '../../core/utils/resources';
import {Comparator, Converter} from '../../core/utils/utils';
import FacebookToken = Facebook.FacebookToken;

// Services
import {UserSessionService} from '../user/user-session-service';
import {StorageService} from '../localstorage/storage-service';
import {SocketIoService} from '../notification/socket-io-service';
import {NotificationWatcherService} from '../notification/notification-watcher-service';
import {AdsService} from '../../advertise/ads-service';
import {LastItemsService} from '../../browse/last-items-service';
import {DeepLinkingService} from '../deeplinking/deep-linking-service';
import {PushNotificationService} from '../notification/push-notification-service';
import {ChatWatcherService} from '../notification/chat-watcher-service';
import {AccessTokenBody, AccessTokenService} from '../user/access-token-service';
import {SubscriptionService} from '../user/subscription-service';

export interface LoginState {
    accessToken: AccessToken;
    state: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private loginState: LoginState;
    private subject = new Subject<LoginState>();

    constructor(private httpClient: HttpClient,
                private userAccessService: UserSessionService,
                private storageService: StorageService,
                private socketIoService: SocketIoService,
                private notificationWatcherService: NotificationWatcherService,
                private chatWatcherService: ChatWatcherService,
                private adsService: AdsService,
                private lastItemsService: LastItemsService,
                private deepLinkingService: DeepLinkingService,
                private pushNotificationService: PushNotificationService,
                private accessTokenService: AccessTokenService,
                private subscriptionService: SubscriptionService) {

    }

    initLoginState() {
        this.storageService.retrieveAccessToken().then((accessToken: AccessToken) => {
            if (!Comparator.isEmpty(accessToken)) {
                if (this.isTokenExpired(accessToken)) {
                    // Process new login
                    this.setLoginState(accessToken, Resources.Constants.LOGIN.STATE.TOKEN_EXPIRED);
                } else {
                    // If token still valid
                    this.setLoginState(accessToken, Resources.Constants.LOGIN.STATE.TOKEN_OK);
                }
            } else {
                this.setLoginState(accessToken, Resources.Constants.LOGIN.STATE.NO_TOKEN);
            }
        }, (err: string) => {
            // Do no auto login
            this.setLoginState(null, Resources.Constants.LOGIN.STATE.NO_TOKEN);
        });
    }

    private isTokenExpired(accessToken: AccessToken): boolean {
        return accessToken.expirationDate == null || (Converter.getDateObj(accessToken.expirationDate).getTime() < new Date().getTime());
    }

    private setLoginState(accessToken: AccessToken, state: string) {
        this.loginState = {accessToken: accessToken, state: state};
        this.subject.next(this.loginState);
    }

    getLoginState(): LoginState {
        return this.loginState;
    }

    watchLoginState(): Observable<LoginState> {
        return this.subject.asObservable();
    }

    facebookMobileLogin(authResponse: FacebookToken, iOSPlatform: boolean, androidPlatform: boolean): Promise<{}> {

        return new Promise((resolve, reject) => {

            const body = {
                fbToken: authResponse.accessToken,
                fbTokenExpiresIn: authResponse.expiresIn,
                appName: 'ReedRichards',
                authKey: Resources.Constants.API.AUTH_KEY
            };

            this.socialLogin(Resources.Constants.API.FACEBOOK_MOBILE_LOGIN, body,
                iOSPlatform, androidPlatform).then((hasAlreadySetParams: boolean) => {
                resolve(hasAlreadySetParams);
            }, (err: any) => {
                reject(err);
            });
        });
    }

    facebookPWALogin(code: string): Promise<{}> {

        return new Promise((resolve, reject) => {

            const body = {
                fbCode: code,
                fbRedirectUri: encodeURIComponent(Resources.Constants.FACEBOOK.PWA.REDIRECT_URL),
                appName: 'ReedRichards',
                authKey: Resources.Constants.API.AUTH_KEY
            };

            this.socialLogin(Resources.Constants.API.FACEBOOK_PWA_LOGIN, body, false, false).then((hasAlreadySetParams: boolean) => {
                resolve(hasAlreadySetParams);
            }, (err: any) => {
                reject(err);
            });
        });
    }

    googlePWALogin(code: string): Promise<{}> {

        return new Promise((resolve, reject) => {

            const body = {
                googleCode: code,
                googleRedirectUri: encodeURIComponent(Resources.Constants.GOOGLE.LOGIN.PWA.REDIRECT_URL),
                appName: 'ReedRichards',
                authKey: Resources.Constants.API.AUTH_KEY
            };

            this.socialLogin(Resources.Constants.API.GOOGLE_PWA_LOGIN, body, false, false).then((hasAlreadySetParams: boolean) => {
                resolve(hasAlreadySetParams);
            }, (err: any) => {
                reject(err);
            });
        });
    }

    googleLogin(authResponse: any, iOSPlatform: boolean, androidPlatform: boolean): Promise<{}> {
        return new Promise((resolve, reject) => {
            const body = {
                googleAccessToken: authResponse.accessToken,
                googleIdToken: authResponse.idToken,
                googleRefreshToken: authResponse.refreshToken,
                appName: 'ReedRichards',
                iOSPlatform: '' + iOSPlatform,
                androidPlatform: '' + androidPlatform,
                authKey: Resources.Constants.API.AUTH_KEY
            };

            this.socialLogin(Resources.Constants.API.GOOGLE_LOGIN, body, iOSPlatform, androidPlatform)
                .then((hasAlreadySetParams: boolean) => {
                    resolve(hasAlreadySetParams);
                }, (err: any) => {
                    reject(err);
                });
        });
    }

    private socialLogin(url: string, body: any, iOSPlatform: boolean, androidPlatform: boolean): Promise<{}> {
        return new Promise((resolve, reject) => {
            const headers: HttpHeaders = new HttpHeaders();
            headers.append('Content-Type', 'application/json');

            this.httpClient.post(url,
                body, {headers: headers})
                .pipe(
                    timeout(Resources.Constants.TIME_OUT.LOGIN)
                )
                .subscribe((user: UserAccess) => {
                    this.processLogin(user, iOSPlatform, androidPlatform).then((hasAlreadySetParams: boolean) => {
                        resolve(hasAlreadySetParams);
                    }, (err: string) => {
                        reject(err);
                    });
                }, (errorResponse: any) => {
                    reject(errorResponse);
                });
        });
    }

    peterparkerLogin(accessToken: AccessToken, iOSPlatform: boolean, androidPlatform: boolean): Promise<{}> {

        return new Promise((resolve, reject) => {

            const headers: HttpHeaders = new HttpHeaders();
            headers.append('Content-Type', 'application/json');

            const body = {
                token: accessToken.apiAccessToken,
                userId: accessToken.userId,
                appName: 'ReedRichards',
                authKey: Resources.Constants.API.AUTH_KEY
            };

            this.httpClient.post(Resources.Constants.API.LOGIN,
                body, {headers: headers})
                .pipe(
                    timeout(Resources.Constants.TIME_OUT.LOGIN)
                )
                .subscribe((user: UserAccess) => {
                    this.processLogin(user, iOSPlatform, androidPlatform).then((hasAlreadySetParams: boolean) => {
                        resolve(hasAlreadySetParams);
                    }, (err: string) => {
                        reject(err);
                    });
                }, (errorResponse: any) => {
                    reject(errorResponse);
                });
        });
    }

    private processLogin(userAccess: UserAccess, iOSPlatform: boolean, androidPlatform: boolean): Promise<{}> {
        return new Promise((resolve, reject) => {
            if (Comparator.isEmpty(userAccess) || Comparator.isEmpty(userAccess.user)) {
                reject(new Error('User access is null'));
            } else {
                // User has already set an address in the database?
                const hasAlreadySetParams: boolean = !Comparator.isStringEmpty(userAccess.user.status) &&
                    !Comparator.equals(userAccess.user.status, Resources.Constants.USER.STATUS.INITIALIZED);

                // Save the user values in session and local storage
                this.storageService.saveAccessToken(userAccess.accessToken).then((accessToken: AccessToken) => {
                    this.accessTokenService.setAccessToken(accessToken);
                    this.userAccessService.setUser(userAccess.user);
                    this.subscriptionService.setSubscription(userAccess.subscription);
                    this.subscriptionService.setFreemiumRules(userAccess.freemiumRules);

                    // Tell root component user is now loaded (display in menu)
                    this.userAccessService.emit();

                    this.initSocketIo(accessToken);
                    this.initPushNotification(iOSPlatform, androidPlatform);

                    resolve(hasAlreadySetParams);
                }, (err: string) => {
                    reject(err);
                });
            }
        });
    }

    private initSocketIo(accessToken: AccessToken) {
        this.socketIoService.connect(accessToken).then(() => {
            this.notificationWatcherService.init();
            this.chatWatcherService.initSocketIoListener();
        });
    }

    private initPushNotification(iOSPlatform: boolean, androidPlatform: boolean) {
        if (!iOSPlatform && !androidPlatform) {
            // Do nothing
            return;
        }

        this.pushNotificationService.init(iOSPlatform, androidPlatform).then(() => {
            // Do nothing
        });
    }

    logout(status: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['status'] = status;

                const promises = new Array();

                promises.push(this.storageService.clear());
                promises.push(this.pushNotificationService.unregister());
                promises.push(this.socketIoService.close());

                this.httpClient.post(Resources.Constants.API.LOGOUT,
                    body, {headers: headers})
                    .subscribe((response: any) => {

                        forkJoin(promises).subscribe(
                            (data: any[]) => {
                                this.resetServices();
                                resolve();
                            },
                            (err: any) => {
                                this.resetServices();
                                // In any case logout
                                resolve();
                            }
                        );

                    }, (errorResponse: any) => {
                        // Don't show error, just logout and clear cache
                        forkJoin(promises).subscribe(
                            (data: any[]) => {
                                this.resetServices();
                                resolve();
                            },
                            (err: any) => {
                                this.resetServices();
                                // In any case logout
                                resolve();
                            }
                        );
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    private resetServices() {
        this.accessTokenService.reset();
        this.userAccessService.reset();
        this.subscriptionService.reset();
        this.adsService.reset();
        this.lastItemsService.reset();
        this.deepLinkingService.reset();
    }
}

