import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';

import {environment} from '../../../../environments/environment';

import {Facebook} from '@ionic-native/facebook/ngx';

// Utils
import {Resources} from '../../core/utils/resources';
import {Comparator, Converter, Validator} from '../../core/utils/utils';

// Services
import {StorageService} from '../../core/localstorage/storage-service';

@Injectable({
    providedIn: 'root'
})
export class FacebookNativeService {

    constructor(@Inject(DOCUMENT) private document: Document,
                private facebook: Facebook,
                private storageService: StorageService) {

    }

    init() {
        if (!environment.cordova) {
            FB.init({
                appId: Resources.Constants.FACEBOOK.APP_ID,
                xfbml: false,
                version: Resources.Constants.FACEBOOK.API_VERSION
            });
        }
    }

    /**
     * Retrieve login status differently on Cordova or PWA apps
     * @returns {Promise<any>}
     */
    getLoginStatus(): Promise<any> {
        if (environment.cordova) {
            return this.facebook.getLoginStatus();
        } else {
            return new Promise((resolve) => {
                FB.getLoginStatus((response: any) => {
                    resolve(response);
                });
            });
        }
    }

    login(successCallback: any, errorCallback: any) {
        if (environment.cordova) {
            this.cordovaLogin(successCallback, errorCallback);
        } else {
            this.pwaLogin();
        }
    }

    getSocialSharing(baseContent: string, hashtag: string): Promise<{}> {
        const sharedUrl: string = Resources.Constants.SOCIAL_SHARING.FLUSTER_WEBSITE;

        const sharedImgUrl: string = Converter.getFlusterShareImgURL(true);

        let content: string = baseContent;

        if (Comparator.isStringEmpty(hashtag)) {
            content += ' ';
            content += hashtag;
        }

        if (environment.cordova) {
            return this.facebook.showDialog(
                {
                    method: 'share',
                    href: sharedUrl,
                    caption: content,
                    picture: sharedImgUrl,
                    hashtag: hashtag
                }
            );
        } else {
            return new Promise((resolve) => {
                FB.ui({
                    method: 'send',
                    link: sharedUrl,
                    app_id: Resources.Constants.FACEBOOK.APP_ID
                }, (response: any) => {
                    resolve(response);
                });
            });
        }
    }

    private cordovaLogin(successCallback: any, errorCallback: any) {
        this.facebook.login(Resources.Constants.FACEBOOK.SCOPE).then((response) => {
            successCallback(response);
        }, (error) => {
            errorCallback(error);
        });
    }

    private pwaLogin() {
        const state: string = Validator.generateRandomString(16);

        this.storageService.saveLoginState({state: state, googleAuth: false}).then(() => {
            const fbUrl: string = Resources.Constants.FACEBOOK.PWA.URL +
                Resources.Constants.FACEBOOK.API_VERSION + '/dialog/oauth?client_id=' +
                Resources.Constants.FACEBOOK.APP_ID + '&redirect_uri=' +
                encodeURIComponent(Resources.Constants.FACEBOOK.PWA.REDIRECT_URL) +
                '&state=' + state + '&scope=' + Resources.Constants.FACEBOOK.SCOPE.toString();

            this.document.location.href = fbUrl;
        });
    }

    logout(): Promise<{}> {
        if (!environment.cordova) {
            return new Promise((resolve) => {

                if (FB.getAuthResponse() != null) {
                    FB.logout((result: any) => {
                        resolve(result);
                    });
                } else {
                    // Facebook not registered, logout anyway
                    resolve();
                }
            });
        } else {
            return this.facebook.logout();
        }
    }

}
