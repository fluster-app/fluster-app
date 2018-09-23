import {Component} from '@angular/core';
import {AlertController, LoadingController, ModalController, NavParams, Platform, ToastController} from '@ionic/angular';

import {forkJoin} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

// Abstract
import {AbstractApplicantSelectionPage} from '../../../pages/advertise/applicant/abstract-applicant-selection';

// Model
import {Applicant} from '../../../services/model/appointment/applicant';
import {Appointment} from '../../../services/model/appointment/appointment';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {NotificationService} from '../../../services/core/notification/notification-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {CalendarService} from '../../../services/native/calendar/calendar-service';
import {AppointmentService} from '../../../services/core/appointment/appointment-service';
import {UserSessionService} from '../../../services/core/user/user-session-service';

@Component({
    templateUrl: 'reschedule-appointments.html',
    styleUrls: ['./reschedule-appointments.scss'],
    selector: 'app-reschedule-appointments'
})
export class RescheduleAppointmentsModal extends AbstractApplicantSelectionPage {

    appointment: Appointment;

    updatedSchedule: Date;

    // Load status in string otherwise when we change it the display gonna be refreshed
    applicantStatus: string;

    constructor(protected platform: Platform,
                protected loadingController: LoadingController,
                protected alertController: AlertController,
                private modalController: ModalController,
                private navParams: NavParams,
                protected translateService: TranslateService,
                protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                protected notificationService: NotificationService,
                protected toastController: ToastController,
                protected appointmentService: AppointmentService,
                protected calendarService: CalendarService,
                protected userSessionService: UserSessionService) {
        super(platform, loadingController, alertController, translateService, googleAnalyticsNativeService, appointmentService, calendarService, toastController, notificationService, userSessionService);

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.APPLICANT.APPLICANT_APPOINTMENTS);
    }

    ionViewWillEnter() {
        this.user = this.userSessionService.getUser();

        this.applicant = this.navParams.get('applicant');
        this.applicantStatus = this.applicant.status;

        this.item = this.navParams.get('item');
        this.appointment = this.item.appointment;
    }

    close() {
        this.modalController.dismiss(null).then(() => {
            // Do nothing
        });
    }

    protected finishUpdateApplication(updatedApplicant: Applicant) {
        this.modalController.dismiss(updatedApplicant).then(() => {
            // Do nothing
        });
    }

    select(selectedDate: Date) {
        this.updatedSchedule = selectedDate;
    }

    async doReschedule() {
        if (this.updatedSchedule == null) {
            this.displayAlertAtLeastOneAppointment();
            return;
        }

        // Save the previous selected date to remove it from calendar and set the new selected to the applicant
        const previousSelectedDate: Date = this.applicant.selected;
        this.applicant.selected = this.updatedSchedule;

        await this.updateAndExportToCalendar(this.RESOURCES.APPLICANT.STATUS.ACCEPTED, previousSelectedDate);
    }

    isApplicantReschedule(): boolean {
        return !Comparator.isEmpty(this.applicant) && Comparator.equals(this.RESOURCES.APPLICANT.STATUS.TO_RESCHEDULE, this.applicantStatus);
    }

    isApplicantAccepted(): boolean {
        return !Comparator.isEmpty(this.applicant) && Comparator.equals(this.RESOURCES.APPLICANT.STATUS.ACCEPTED, this.applicantStatus);
    }

    private displayAlertAtLeastOneAppointment() {
        const promises = new Array();
        promises.push(this.translateService.get('RESCHEDULE.NO_SELECTED_TIME'));
        promises.push(this.translateService.get('CORE.OK'));

        forkJoin(promises).subscribe(
            async (data: string[]) => {
                if (!Comparator.isEmpty(data) && data.length === promises.length) {
                    const alert: HTMLIonAlertElement = await this.alertController.create({
                        header: data[0],
                        buttons: [data[1]]
                    });

                    await alert.present();
                }
            });
    }
}
