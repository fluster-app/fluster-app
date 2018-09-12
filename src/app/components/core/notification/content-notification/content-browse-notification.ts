import {Component, Input, AfterViewInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {AlertController} from '@ionic/angular';

import {forkJoin} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

// Model
import {Notification} from '../../../../services/model/notification/notification';
import {User} from '../../../../services/model/user/user';

// Abstract
import {AbstractContentNotification} from './abstract-content-notification';


// Utils
import {Comparator} from '../../../../services/core/utils/utils';

// Services
import {NotificationWatcherService} from '../../../../services/core/notification/notification-watcher-service';
import {UserSessionService} from '../../../../services/core/user/user-session-service';
import {CalendarService} from '../../../../services/native/calendar/calendar-service';

@Component({
    templateUrl: 'content-browse-notification.html',
    selector: 'app-content-browse-notification'
})
export class ContentBrowseNotificationComponent extends AbstractContentNotification implements AfterViewInit, OnDestroy {

    @Input() displayOnInit: boolean = false;

    @Output() notifyNewNotifications: EventEmitter<{}> = new EventEmitter<{}>();

    @Output() notifyCalendarInitialized: EventEmitter<{}> = new EventEmitter<{}>();

    constructor(private alertController: AlertController,
                private translateService: TranslateService,
                private calendarService: CalendarService,
                private notificationWatcherService: NotificationWatcherService,
                private userSessionService: UserSessionService) {
        super();

        this.notifierSubscription = this.notificationWatcherService.newBrowseNotification
            .subscribe(async (newBrowseNotifications: Notification[]) => await this.processNewNotifications(newBrowseNotifications));
    }

    async ngAfterViewInit() {
        this.newNotifications = this.notificationWatcherService.getBrowseNewNotifications();

        if (this.displayOnInit) {
            await this.processNotifications(true);
        }
    }

    ngOnDestroy(): void {
        if (this.notifierSubscription != null) {
            this.notifierSubscription.unsubscribe();
        }
    }

    hasSingleNotificationAccepted(): boolean {
        return this.hasSingleNewNotifications() && this.newNotifications[0].type ===
            this.RESOURCES.NOTIFICATION.TYPE.APPLICATION_ACCEPTED;
    }

    hasSingleNotificationToReschedule(): boolean {
        return this.hasSingleNewNotifications() && this.newNotifications[0].type ===
            this.RESOURCES.NOTIFICATION.TYPE.APPLICATION_TO_RESCHEDULE;
    }

    hasSingleNotificationAppointmentRescheduled(): boolean {
        return this.hasSingleNewNotifications() && this.newNotifications[0].type ===
            this.RESOURCES.NOTIFICATION.TYPE.APPOINTMENT_RESCHEDULED;
    }

    private async processNewNotifications(newNotifications: Notification[]) {
        this.newNotifications = newNotifications;
        await this.processNotifications(false);
    }

    private processNotifications(afterViewInit: boolean): Promise<void> {
        return new Promise((resolve) => {
            this.markNotificationsAsRead();
            this.displayNewNotifications();
            this.processCalendar(afterViewInit);

            if (!afterViewInit && Comparator.hasElements(this.newNotifications)) {
                this.notifyNewNotifications.emit();
            }

            resolve();
        });
    }

    private markNotificationsAsRead() {
        this.notificationWatcherService.markAllBrowseNotificationsRead().then(() => {
            // Do nothing
        });
    }

    private processCalendar(afterViewInit: boolean) {
        if (!Comparator.hasElements(this.newNotifications)) {
            this.notifyCalendar(afterViewInit);
            return;
        }

        this.hasAppointmentsToExportToCalendar().then((hasAccepted: boolean) => {
            const user: User = this.userSessionService.getUser();

            if (hasAccepted && user.userParams.appSettings.calendarExport === null && this.ENV_CORDOVA) {
                this.askUserAndExportIfNeeded(user, afterViewInit);
            } else {
                this.exportToCalendar(user).then(() => {
                    this.notifyCalendar(afterViewInit);
                });
            }
        });
    }

    private hasAppointmentsToExportToCalendar(): Promise<boolean> {
        return new Promise((resolve) => {
            resolve(this.hasAcceptedNotifications());
        });
    }

    private hasAcceptedNotifications(): boolean {
        for (let i: number = 0; i < this.newNotifications.length; i++) {
            if (this.newNotifications[i].applicant.status === this.RESOURCES.APPLICANT.STATUS.ACCEPTED) {
                return true;
            }
        }

        return false;
    }

    private async askUserAndExportIfNeeded(user: User, afterViewInit: boolean) {
        const header: string = this.translateService.instant('CALENDAR.EXPORT.ASK.TITLE');
        const question: string = this.translateService.instant('CALENDAR.EXPORT.ASK.QUESTION');
        const yes: string = this.translateService.instant('CORE.YES');
        const no: string = this.translateService.instant('CORE.NO');

        const confirm: HTMLIonAlertElement = await this.alertController.create({
            header: header,
            message: question,
            buttons: [
                {
                    text: no,
                    handler: () => {
                        this.setUserToAndExportCalendar(user, false, afterViewInit);
                    }
                },
                {
                    text: yes,
                    handler: () => {
                        this.setUserToAndExportCalendar(user, true, afterViewInit);
                    }
                }
            ]
        });

        await confirm.present();
    }

    private setUserToAndExportCalendar(user: User, choice: boolean, afterViewInit: boolean) {
        user.userParams.appSettings.calendarExport = choice;
        this.userSessionService.setUserToSave(user);

        this.exportToCalendar(user).then(() => {
            this.notifyCalendar(afterViewInit);
        });
    }

    private exportToCalendar(user: User): Promise<{}> {
        return new Promise((resolve) => {
            if (user.userParams.appSettings.calendarExport) {

                const promises = new Array();

                for (let i: number = 0; i < this.newNotifications.length; i++) {

                    const notification: Notification = this.newNotifications[i];

                    if (Comparator.equals(this.RESOURCES.APPLICANT.STATUS.ACCEPTED, notification.applicant.status)) {
                        promises.push(this.calendarService.handleAppoinmentCalendar(notification.item,
                            notification.applicant.selected, notification.userFrom.facebook.firstName, true, false));
                    }
                }

                if (promises.length > 0) {
                    forkJoin(promises).subscribe(
                        (data: any) => {
                            resolve();
                        },
                        (err: any) => {
                            // We ignore the error
                            resolve();
                        }
                    );
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        });
    }

    private notifyCalendar(afterViewInit: boolean) {
        // If we process on init, then emit when calendar is processed
        if (afterViewInit) {
            this.notifyCalendarInitialized.emit();
        }
    }
}
