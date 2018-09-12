import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';

import {Push, PushObject, RegistrationEventResponse} from '@ionic-native/push/ngx';

import {TranslateService} from '@ngx-translate/core';

// Utils
import {Resources} from '../../core/utils/resources';
import {Comparator} from '../utils/utils';
import {AccessTokenBody, AccessTokenService} from '../user/access-token-service';

@Injectable({
    providedIn: 'root'
})
export class PushNotificationService {

    pushObject: PushObject;

    constructor(private httpClient: HttpClient,
                private push: Push,
                private translateService: TranslateService,
                private accessTokenService: AccessTokenService) {

    }

    init(iOSPlatform: boolean, androidPlatform: boolean): Promise<{}> {
        return new Promise((resolve) => {
            this.pushObject = this.push.init({
                android: {
                    senderID: Resources.Constants.GOOGLE.PROJECT.NUMBER,
                    icon: 'icon_notification_fluster',
                    iconColor: '#ff65a9',
                    sound: true
                },
                ios: {
                    alert: 'true',
                    badge: true,
                    sound: 'true',
                    clearBadge: true
                },
                windows: {}
            });

            if (this.isPushValid()) {
                this.pushObject.on('registration').subscribe((data: RegistrationEventResponse) => {

                    if (!Comparator.isEmpty(data)) {
                        this.updateDevice(data.registrationId, iOSPlatform, androidPlatform).then((result: Communication.PushUpdate) => {
                            // Do nothing
                        }, (errorResponse: HttpErrorResponse) => {
                            // Do nothing
                        });
                    }

                });

                this.clearTheBadge().then(() => {
                    // Do nothing
                }, () => {
                    // Do nothing
                });
            }

            resolve();
        });
    }

    private clearTheBadge(): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.pushObject.setApplicationIconBadgeNumber(0).then(() => {
                resolve();
            }, () => {
                reject();
            });
        });
    }

    private isPushValid(): boolean {
        // In the browser, push gonna contains a .error object
        return !Comparator.isEmpty(this.pushObject) && Comparator.isStringEmpty((<any> this.pushObject).error);
    }

    private updateDevice(deviceTokenId: string, iOSPlatform: boolean, androidPlatform: boolean): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['deviceTokenId'] = deviceTokenId;
                body['iOSPlatform'] = '' + iOSPlatform;
                body['androidPlatform'] = '' + androidPlatform;
                body['deviceLanguage'] = this.translateService.currentLang;

                this.httpClient.post(Resources.Constants.API.PUSH_NOTIFICATIONS, body, {headers: headers})
                    .subscribe((result: Communication.PushUpdate) => {
                        resolve(result);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    unregister(): Promise<{}> {
        return new Promise((resolve, reject) => {
            if (this.isPushValid()) {
                this.pushObject.unregister().then(() => {
                    resolve();
                }, () => {
                    reject();
                });
            } else {
                resolve();
            }
        });
    }
}
