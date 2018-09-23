import {Component} from '@angular/core';
import {
    ActionSheetController,
    AlertController,
    LoadingController,
    ModalController,
    NavParams,
    Platform,
    ToastController
} from '@ionic/angular';

import {forkJoin} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

// Abstract
import {AbstractApplicantSelectionPage} from '../../../pages/advertise/applicant/abstract-applicant-selection';

// Model
import {Applicant} from '../../../services/model/appointment/applicant';

// Services
import {AppointmentService} from '../../../services/core/appointment/appointment-service';
import {UserSessionService} from '../../../services/core/user/user-session-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';

// Utils
import {Comparator, Converter} from '../../../services/core/utils/utils';
import {NotificationService} from '../../../services/core/notification/notification-service';
import {CalendarService} from '../../../services/native/calendar/calendar-service';

@Component({
    templateUrl: 'applicant-appointments.html',
    styleUrls: ['./applicant-appointments.scss'],
    selector: 'app-applicant-appointments'
})
export class ApplicantAppointmentsModal extends AbstractApplicantSelectionPage {

    availableDates: number[];

    constructor(protected platform: Platform,
                private navParams: NavParams,
                private modalController: ModalController,
                protected alertController: AlertController,
                protected loadingController: LoadingController,
                private actionSheetController: ActionSheetController,
                protected toastController: ToastController,
                protected translateService: TranslateService,
                protected userSessionService: UserSessionService,
                protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                protected notificationService: NotificationService,
                protected appointmentService: AppointmentService,
                protected calendarService: CalendarService) {
        super(platform, loadingController, alertController, translateService, googleAnalyticsNativeService, appointmentService, calendarService, toastController, notificationService, userSessionService);

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.APPLICANT.APPLICANT_APPOINTMENTS);
    }

    ionViewWillEnter() {
        this.user = this.userSessionService.getUser();

        this.applicant = this.navParams.get('applicant');
        this.availableDates = this.navParams.get('availableDates');

        // Item needed to export to calendar
        this.item = this.navParams.get('item');
    }

    close() {
        this.modalController.dismiss(null).then(() => {
            // Do nothing
        });
    }

    hasSelectedDates(): boolean {
        return Comparator.hasElements(this.availableDates);
    }

    displayReschedule() {
        const promises = new Array();
        promises.push(this.translateService.get('CORE.CANCEL'));
        promises.push(this.translateService.get('APPLICANT_SELECTION.ACTION_SHEET.ASK_RESCHEDULE'));

        forkJoin(promises).subscribe(
            async (data: string[]) => {
                if (!Comparator.isEmpty(data) && data.length === promises.length) {
                    const myButtons: any = new Array();

                    myButtons.push({
                        text: data[1],
                        role: 'destructive',
                        handler: () => {
                            this.reschedule();
                        }
                    });

                    myButtons.push({
                        text: data[0],
                        role: 'cancel',
                        handler: () => {
                            // Do nothing
                        }
                    });

                    const actionSheet: HTMLIonActionSheetElement = await this.actionSheetController.create({
                        buttons: myButtons
                    });

                    actionSheet.present();
                }
            }
        );
    }

    protected finishUpdateApplication(updatedApplicant: Applicant) {
        this.modalController.dismiss(updatedApplicant).then(() => {
            // Do nothing
        });
    }

    async select(startTime: Date) {

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.ADS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.APPLICANT.APPLICANT_SELECT);

        for (let i: number = 0; i < this.applicant.agenda.length; i++) {
            const tmp: Date = Converter.getDateObj(this.applicant.agenda[i].when);
            if (tmp.getTime() === startTime.getTime()) {
                this.applicant.agenda[i].status = this.RESOURCES.APPLICANT.AGENDA.STATUS.ACCEPTED;
                this.applicant.selected = new Date(startTime);
            } else {
                this.applicant.agenda[i].status = this.RESOURCES.APPLICANT.AGENDA.STATUS.CANCELLED;
            }
        }

        await this.updateAndExportToCalendar(this.RESOURCES.APPLICANT.STATUS.ACCEPTED, null);
    }
}
