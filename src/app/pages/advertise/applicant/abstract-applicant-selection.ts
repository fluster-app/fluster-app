import {AlertController, LoadingController, Platform, ToastController} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {TranslateService} from '@ngx-translate/core';

import {forkJoin} from 'rxjs';

// Pages
import {AbstractPage} from '../../abstract-page';

// Model
import {Applicant} from '../../../services/model/appointment/applicant';
import {User} from '../../../services/model/user/user';
import {Notification} from '../../../services/model/notification/notification';
import {Item} from '../../../services/model/item/item';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {AppointmentService} from '../../../services/core/appointment/appointment-service';
import {CalendarService} from '../../../services/native/calendar/calendar-service';
import {NotificationService} from '../../../services/core/notification/notification-service';
import {UserSessionService} from '../../../services/core/user/user-session-service';

export abstract class AbstractApplicantSelectionPage extends AbstractPage {

    user: User;

    applicant: Applicant;

    item: Item;

    constructor(
        protected platform: Platform,
        protected loadingController: LoadingController,
        protected alertController: AlertController,
        protected translateService: TranslateService,
        protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
        protected appointmentService: AppointmentService,
        protected calendarService: CalendarService,
        protected toastController: ToastController,
        protected notificationService: NotificationService,
        protected userSessionService: UserSessionService) {

        super();
    }

    protected reschedule() {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.ADS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.APPLICANT.APPLICANT_RESCHEDULE);

        this.setAllStatusCancelled().then(async () => {
            await this.updateApplication(this.RESOURCES.APPLICANT.STATUS.TO_RESCHEDULE, null);
        });
    }

    private setAllStatusCancelled(): Promise<{}> {
        return new Promise((resolve) => {
            for (let i: number = 0; i < this.applicant.agenda.length; i++) {
                this.applicant.agenda[i].status = this.RESOURCES.APPLICANT.AGENDA.STATUS.CANCELLED;
            }

            resolve();
        });
    }

    protected async updateApplication(newStatus: string, previousDate: Date) {
        const previousStatus: string = this.applicant.status;

        this.applicant.status = newStatus;

        const self: any = this;

        const loading: HTMLIonLoadingElement = await this.loadingController.create({});

        loading.present().then(() => {
            this.appointmentService.updateApplicant(this.applicant).then((updatedApplicant: Applicant) => {

                this.sendNotification(updatedApplicant, previousStatus).then(() => {
                    this.exportToCalendar(self.user, self.item, updatedApplicant, newStatus, previousStatus, previousDate, loading);
                });
            }, (errorResponse: HttpErrorResponse) => {
                loading.dismiss().then(async () => {
                    await this.errorMsg(this.toastController, this.translateService, 'ERRORS.APPLICANT_SELECTION.NOT_UPDATED');
                });
            });
        });
    }

    private exportToCalendar(user: User, item: Item, updatedApplicant: Applicant, newStatus: string, previousStatus: string, previousDate: Date, loading: HTMLIonLoadingElement) {
        const exportMode: boolean = Comparator.equals(newStatus, this.RESOURCES.APPLICANT.STATUS.ACCEPTED);

        if (user.userParams.appSettings.calendarExport != null && user.userParams.appSettings.calendarExport &&
            (exportMode || (Comparator.equals(newStatus, this.RESOURCES.APPLICANT.STATUS.CANCELLED) &&
                Comparator.equals(previousStatus, this.RESOURCES.APPLICANT.STATUS.ACCEPTED)))) {

            const attendanceMultiple: boolean = Comparator.equals(this.RESOURCES.APPOINTMENT.ATTENDANCE.MULTIPLE, item.appointment.attendance);
            const notes: string = attendanceMultiple ? '' : updatedApplicant.user.facebook.firstName;

            if (previousDate != null) {
                this.calendarService.removeAppoinmentFromCalendar(item, previousDate, notes).then(() => {
                    this.doExportToCalendar(item, updatedApplicant, notes, exportMode, attendanceMultiple, loading);
                }, (err: any) => {
                    this.dismissLoading(updatedApplicant, loading, true);
                });
            } else {
                this.doExportToCalendar(item, updatedApplicant, notes, exportMode, attendanceMultiple, loading);
            }
        } else {
            this.dismissLoading(updatedApplicant, loading, false);
        }
    }

    private doExportToCalendar(item: Item, updatedApplicant: Applicant, notes: string, exportMode: boolean, attendanceMultiple: boolean, loading: HTMLIonLoadingElement) {
        this.calendarService.handleAppoinmentCalendar(item, updatedApplicant.selected, notes, exportMode, !attendanceMultiple).then(() => {
            this.dismissLoading(updatedApplicant, loading, false);
        }, (err: any) => {
            this.dismissLoading(updatedApplicant, loading, true);
        });
    }

    private dismissLoading(updatedApplicant: Applicant, loading: HTMLIonLoadingElement, showCalendarWarning: boolean) {
        loading.dismiss().then(async () => {
            if (showCalendarWarning) {
                await this.errorMsg(this.toastController, this.translateService, 'ERRORS.APPLICANT_SELECTION.CALENDAR_EXPORT');
            }

            this.finishUpdateApplication(updatedApplicant);
        });
    }

    protected abstract finishUpdateApplication(updatedApplicant: Applicant);

    private sendNotification(updatedApplicant: Applicant, previousStatus: string): Promise<{}> {
        return new Promise((resolve) => {
            // Send a notification to applicant if application is accepted or to reschedule
            // If accepted and previousStatus accepted too, send a notification that the appointment was rescheduled

            if (Comparator.equals(this.RESOURCES.APPLICANT.STATUS.ACCEPTED, updatedApplicant.status) || Comparator.equals(this.RESOURCES.APPLICANT.STATUS.TO_RESCHEDULE, updatedApplicant.status)) {

                const sameStatus: boolean = !Comparator.isStringEmpty(previousStatus) && Comparator.equals(previousStatus, updatedApplicant.status);

                const notificationType: string = Comparator.equals(this.RESOURCES.APPLICANT.STATUS.ACCEPTED, updatedApplicant.status) ? (sameStatus ? this.RESOURCES.NOTIFICATION.TYPE.APPOINTMENT_RESCHEDULED : this.RESOURCES.NOTIFICATION.TYPE.APPLICATION_ACCEPTED) : this.RESOURCES.NOTIFICATION.TYPE.APPLICATION_TO_RESCHEDULE;

                this.notificationService.send(this.user, updatedApplicant.user, updatedApplicant.item, updatedApplicant.appointment, updatedApplicant, notificationType).then((notification: Notification) => {
                    resolve();
                }, (errorResponse: HttpErrorResponse) => {
                    // Ignore error
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    protected async updateAndExportToCalendar(newStatus: string, previousDate: Date) {
        if (this.user.userParams.appSettings.calendarExport === null && this.ENV_CORDOVA) {
            this.askUserAndExportIfNeeded(newStatus, previousDate);
        } else {
            await this.updateApplication(newStatus, previousDate);
        }
    }

    private askUserAndExportIfNeeded(newStatus: string, previousDate: Date) {
        const promises = new Array();
        promises.push(this.translateService.get('CALENDAR.EXPORT.ASK.TITLE'));
        promises.push(this.translateService.get('CALENDAR.EXPORT.ASK.QUESTION'));
        promises.push(this.translateService.get('CORE.YES'));
        promises.push(this.translateService.get('CORE.NO'));

        forkJoin(promises).subscribe(
            async (data: string[]) => {
                if (!Comparator.isEmpty(data) && data.length === promises.length) {
                    const confirm: HTMLIonAlertElement = await this.alertController.create({
                        header: data[0],
                        message: data[1],
                        buttons: [
                            {
                                text: data[3],
                                handler: async () => {
                                    await this.updateUserAndUpdateApplication(false, newStatus, previousDate);
                                }
                            },
                            {
                                text: data[2],
                                handler: async () => {
                                    await this.updateUserAndUpdateApplication(true, newStatus, previousDate);
                                }
                            }
                        ]
                    });

                    confirm.present();
                } else {
                    await this.updateUserAndUpdateApplication(false, newStatus, previousDate);
                }
            }
        );
    }

    private async updateUserAndUpdateApplication(choice: boolean, newStatus: string, previousDate: Date) {
        this.saveUserChoice(choice);
        await this.updateApplication(newStatus, previousDate);
    }

    private saveUserChoice(choice: boolean) {
        this.user.userParams.appSettings.calendarExport = choice;
        this.user.updatedAt = new Date();

        this.userSessionService.setUserToSave(this.user);
    }
}
