import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';

import {environment} from '../../../../environments/environment';

import {GooglePlus} from '@ionic-native/google-plus/ngx';

// Utils and resources
import {Resources} from '../../core/utils/resources';
import {Validator} from '../../core/utils/utils';

// Services
import {StorageService} from '../../core/localstorage/storage-service';

@Injectable({
    providedIn: 'root'
})
export class GoogleNativeService {

    constructor(@Inject(DOCUMENT) private document: Document,
                private storageService: StorageService,
                private googlePlus: GooglePlus) {

    }

    login(successCallback: any, errorCallback: any) {
        if (environment.cordova) {
            this.cordovaLogin(successCallback, errorCallback);
        } else {
            this.pwaLogin();
        }
    }

    tryAutomaticLogin(): Promise<any> {
        if (environment.cordova) {
            return this.googlePlus.trySilentLogin({
                webClientId: Resources.Constants.GOOGLE.LOGIN.WEB_CLIENT_ID,
                scopes: Resources.Constants.GOOGLE.LOGIN.SCOPES
            });
        } else {
            return new Promise((resolve) => {
                resolve();
            });
        }
    }

    private cordovaLogin(successCallback: any, errorCallback: any) {
        this.googlePlus.login({
            webClientId: Resources.Constants.GOOGLE.LOGIN.WEB_CLIENT_ID,
            scopes: Resources.Constants.GOOGLE.LOGIN.SCOPES
        })
            .then(res => {
                successCallback(res);
            })
            .catch((err: any) => {
                errorCallback(err);
            });
    }

    private pwaLogin() {
        const state: string = Validator.generateRandomString(16);

        this.storageService.saveLoginState({state: state, googleAuth: true}).then(() => {
            const googleUrl: string = Resources.Constants.GOOGLE.LOGIN.PWA.URL +
                'client_id=' + Resources.Constants.GOOGLE.LOGIN.WEB_CLIENT_ID +
                '&response_type=code&scope=openid%20profile%20email%20' + Resources.Constants.GOOGLE.LOGIN.SCOPES +
                '&redirect_uri=' + encodeURIComponent(Resources.Constants.GOOGLE.LOGIN.PWA.REDIRECT_URL) +
                '&nonce=' + state + '&state=' + state;

            this.document.location.href = googleUrl;
        });
    }

    logout(): Promise<{}> {
        if (!environment.cordova) {
            return new Promise((resolve) => {
                resolve();
            });
        } else {
            return this.googlePlus.logout();
        }
    }
}
