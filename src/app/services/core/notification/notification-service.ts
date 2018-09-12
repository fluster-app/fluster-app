import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';

import {forkJoin} from 'rxjs';

// Model
import {Appointment} from '../../model/appointment/appointment';
import {Applicant} from '../../model/appointment/applicant';
import {Item} from '../../model/item/item';
import {User} from '../../model/user/user';
import {Notification} from '../../model/notification/notification';

// Utils and resources
import {Resources} from '../../core/utils/resources';
import {Comparator} from '../utils/utils';

// Services
import {AccessTokenBody, AccessTokenService} from '../user/access-token-service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService) {

    }

    send(userFrom: User, userTo: User, item: Item, appointment: Appointment, applicant: Applicant, type: string): Promise<{}> {

        return new Promise(async (resolve, reject) => {
            try {
                const notification: Notification = new Notification();
                notification.userTo = userTo;
                notification.userFrom = userFrom;
                notification.item = item;
                notification.appointment = appointment;
                notification.applicant = applicant;
                notification.type = type;

                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['notification'] = notification;

                this.httpClient.post(Resources.Constants.API.NOTIFICATIONS, body, {headers: headers})
                    .subscribe((data: Notification) => {
                        resolve(data);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });

    }

    markAllRead(notifications: Notification[]): Promise<{}> {

        const promises = new Array();

        // Set notification to read=true and push into promises array
        for (let i: number = 0; i < notifications.length; i++) {
            const notification: Notification = notifications[i];
            notification.read = true;

            promises.push(this.update(notification));
        }

        return new Promise((resolve, reject) => {
            forkJoin(promises)
                .subscribe((data: Notification[]) => {
                    resolve();
                }, (errorResponse: HttpErrorResponse) => {
                    reject();
                });
        });
    }

    private update(notification: Notification): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['notification'] = notification;

                this.httpClient.put(Resources.Constants.API.NOTIFICATIONS + notification._id, body, {headers: headers})
                    .subscribe((data: Notification) => {
                        resolve(data);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    getUnreadNotifications(types: string[]): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();
                params = params.append('types', types.join());

                this.httpClient.get(Resources.Constants.API.NOTIFICATIONS, {params: params})
                    .subscribe((data: Notification[]) => {
                        resolve(data);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    markSuperstarNotificationAsRead(itemId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();

                this.httpClient.put(Resources.Constants.API.NOTIFICATIONS + itemId + '/superstars', body, {headers: headers})
                    .subscribe((data: Notification) => {
                        resolve(data);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    hasApplicantUnreadNotifications(itemId: string, appointmentId: string, applicantId: string, itemUserId: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                const types: string[] = new Array();
                types.push(Resources.Constants.NOTIFICATION.TYPE.APPLICATION_NEW);

                params = params.append('types', types.join());

                params = params.append('itemId', itemId);
                params = params.append('appointmentId', appointmentId);
                params = params.append('applicantId', applicantId);
                params = params.append('userTo', itemUserId);

                this.httpClient.get(Resources.Constants.API.NOTIFICATIONS, {params: params})
                    .subscribe((data: Notification[]) => {
                        resolve(Comparator.hasElements(data));
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }
}
