import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';

// Model
import {Notification} from '../../model/notification/notification';

// Utils and resources
import {Resources} from '../../core/utils/resources';
import {Comparator} from '../../core/utils/utils';

// Services
import {SocketIoService} from './socket-io-service';
import {NotificationService} from './notification-service';

@Injectable({
    providedIn: 'root'
})
export class NotificationWatcherService {

    private advertiseNotifications: Notification[] = new Array();
    private browseNotifications: Notification[] = new Array();

    private newAdvertiseNotificationSource: Subject<Notification[]> = new Subject<Notification[]>();
    private newBrowseNotificationSource: Subject<Notification[]> = new Subject<Notification[]>();

    newAdvertiseNotification: Observable<Notification[]> = this.newAdvertiseNotificationSource.asObservable();
    newBrowseNotification: Observable<Notification[]> = this.newBrowseNotificationSource.asObservable();

    constructor(private socketIoService: SocketIoService,
                private notificationService: NotificationService) {
    }

    init() {
        this.socketIoService.on(Resources.Constants.NOTIFICATION.TYPE.APPLICATION_NEW, (notification: Notification) => {
            this.advertiseNotifications.push(notification);

            this.emitNewAdvertiseNotification(notification);
        });

        this.socketIoService.on(Resources.Constants.NOTIFICATION.TYPE.APPLICATION_ACCEPTED, (notification: Notification) => {
            this.browseNotifications.push(notification);

            this.emitNewBrowseNotification(notification);
        });

        this.socketIoService.on(Resources.Constants.NOTIFICATION.TYPE.APPLICATION_TO_RESCHEDULE, (notification: Notification) => {
            this.browseNotifications.push(notification);

            this.emitNewBrowseNotification(notification);
        });

        this.socketIoService.on(Resources.Constants.NOTIFICATION.TYPE.APPOINTMENT_RESCHEDULED, (notification: Notification) => {
            this.browseNotifications.push(notification);

            this.emitNewBrowseNotification(notification);
        });
    }

    getAdvertiseNewNotifications(): Notification[] {
        return this.advertiseNotifications;
    }

    getBrowseNewNotifications(): Notification[] {
        return this.browseNotifications;
    }

    resetAdvertiseNotifications() {
        this.advertiseNotifications = new Array<Notification>();
        this.emitNewAdvertiseNotifications(this.advertiseNotifications);
    }

    resetBrowseNotifications() {
        this.browseNotifications = new Array<Notification>();
        this.emitNewBrowseNotifications(this.browseNotifications);
    }

    private emitNewAdvertiseNotification(advertiseNotification: Notification) {
        const tmp: Notification[] = new Array();
        tmp.push(advertiseNotification);

        this.emitNewAdvertiseNotifications(tmp);
    }

    private emitNewBrowseNotification(browseNotification: Notification) {
        const tmp: Notification[] = new Array();
        tmp.push(browseNotification);

        this.emitNewBrowseNotifications(tmp);
    }

    private emitNewAdvertiseNotifications(advertiseNotifications: Notification[]) {
        this.newAdvertiseNotificationSource.next(advertiseNotifications);
    }

    private emitNewBrowseNotifications(browseNotifications: Notification[]) {
        this.newBrowseNotificationSource.next(browseNotifications);
    }

    initNotifications(): Promise<{}> {
        return new Promise((resolve) => {
            const types: string[] = new Array();
            types.push(Resources.Constants.NOTIFICATION.TYPE.APPLICATION_NEW);
            types.push(Resources.Constants.NOTIFICATION.TYPE.APPLICATION_ACCEPTED);
            types.push(Resources.Constants.NOTIFICATION.TYPE.APPLICATION_TO_RESCHEDULE);
            types.push(Resources.Constants.NOTIFICATION.TYPE.APPOINTMENT_RESCHEDULED);

            this.notificationService.getUnreadNotifications(types).then((data: Notification[]) => {
                this.filterInitNotifications(data).then(() => {
                    resolve(data);
                });
            }, (errorResponse: HttpErrorResponse) => {
                // Ignore error
                resolve(new Array());
            });
        });
    }

    private filterInitNotifications(notifications: Notification[]): Promise<{}> {
        // We iterate over the notifications to put them in the right array side notifications
        return new Promise((resolve) => {
            this.advertiseNotifications = new Array();
            this.browseNotifications = new Array();

            if (Comparator.hasElements(notifications)) {
                for (let i: number = 0; i < notifications.length; i++) {
                    if (Comparator.equals(Resources.Constants.NOTIFICATION.TYPE.APPLICATION_NEW, notifications[i].type)) {
                        this.advertiseNotifications.push(notifications[i]);
                    } else {
                        this.browseNotifications.push(notifications[i]);
                    }
                }

                resolve();
            } else {
                resolve();
            }
        });
    }

    markAllAdvertiseNotificationsRead(clear: boolean): Promise<{}> {

        return new Promise((resolve) => {
            if (!Comparator.isEmpty(this.advertiseNotifications)) {
                this.markNotificationsRead(this.advertiseNotifications).then(() => {
                    if (clear) {
                        this.resetAdvertiseNotifications();
                    }

                    resolve();
                }, () => {
                    // Do nothing
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    markAllBrowseNotificationsRead(): Promise<{}> {
        return new Promise((resolve) => {
            if (!Comparator.isEmpty(this.browseNotifications)) {
                this.markNotificationsRead(this.browseNotifications).then(() => {
                    resolve();
                }, () => {
                    // Do nothing
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    private markNotificationsRead(notifications: Notification[]): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.notificationService.markAllRead(notifications).then(() => {
                resolve();
            }, () => {
                reject();
            });

        });
    }
}
