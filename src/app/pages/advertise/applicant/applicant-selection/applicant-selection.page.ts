import {Component} from '@angular/core';
import {Location} from '@angular/common';
import {
    ActionSheetController,
    AlertController,
    LoadingController,
    ModalController,
    NavController,
    Platform,
    ToastController
} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';
import {HttpErrorResponse} from '@angular/common/http';

import {forkJoin} from 'rxjs';

import * as moment from 'moment';

import {TranslateService} from '@ngx-translate/core';

// Pages
import {AbstractApplicantSelectionPage} from '../abstract-applicant-selection';

// Modal
import {ApplicantAppointmentsModal} from '../../../../modals/advertise/applicant-appointments/applicant-appointments';

// Model
import {Applicant, ApplicantCancellation} from '../../../../services/model/appointment/applicant';

// Resources and utils
import {Comparator, Converter} from '../../../../services/core/utils/utils';

// Services
import {UserSessionService} from '../../../../services/core/user/user-session-service';
import {AppointmentService} from '../../../../services/core/appointment/appointment-service';
import {CalendarService} from '../../../../services/native/calendar/calendar-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {NotificationService} from '../../../../services/core/notification/notification-service';
import {ComplaintService} from '../../../../services/core/complaint/complaint-service';
import {ApplicantSelectionNavParams, NavParamsService} from '../../../../services/core/navigation/nav-params-service';

@Component({
    selector: 'app-applicant-selection',
    templateUrl: './applicant-selection.page.html',
    styleUrls: ['./applicant-selection.page.scss'],
})
export class ApplicantSelectionPage extends AbstractApplicantSelectionPage {

    applicantIndex: number;
    updateApplicantCallback: any;

    // Selected date of the applicant - the dates where user already have appointments
    availableDates: number[];

    // Avoid to change display while service are called
    currentStatus: string;

    category: string = 'who';

    userProfileLoaded: boolean = false;
    availableDatesLoaded: boolean = false;

    userStarred: boolean = false;

    constructor(private location: Location,
                protected platform: Platform,
                private navController: NavController,
                private modalController: ModalController,
                protected loadingController: LoadingController,
                protected toastController: ToastController,
                protected alertController: AlertController,
                protected translateService: TranslateService,
                private actionSheetController: ActionSheetController,
                protected userSessionService: UserSessionService,
                protected appointmentService: AppointmentService,
                protected calendarService: CalendarService,
                protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                protected notificationService: NotificationService,
                private complaintService: ComplaintService,
                private navParamsService: NavParamsService) {
        super(platform, loadingController, alertController, translateService, googleAnalyticsNativeService, appointmentService, calendarService, toastController, notificationService, userSessionService);

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ADS.APPPLICANT_SELECTION);

    }

    async ionViewWillEnter() {
        try {
            const applicantSelectionNavParams: ApplicantSelectionNavParams = await this.navParamsService.getApplicantSelectionNavParams();
            this.applicant = applicantSelectionNavParams.applicant;

            this.applicantIndex = applicantSelectionNavParams.applicantIndex;
            this.updateApplicantCallback = applicantSelectionNavParams.updateApplicantCallback;
            this.item = applicantSelectionNavParams.item;
            this.userStarred = applicantSelectionNavParams.userStarred;
            if (this.applicant != null) {

                this.currentStatus = this.applicant.status;
            }

            this.user = this.userSessionService.getUser();

            this.buildPossibleAgenda();
        } catch (err) {
            // Load nothing
        }
    }

    async back() {
        try {
            // Tricks, we don't want effect on go back
            const applicantSelectionNavParams: ApplicantSelectionNavParams = await this.navParamsService.getApplicantSelectionNavParams();
            const subPage: string = applicantSelectionNavParams.subPage;

            if (!Comparator.isStringEmpty(subPage)) {
                this.navController.navigateBack('/' + subPage, false);
            } else {
                this.location.back();
            }
        } catch (err) {
            this.location.back();
        }
    }

    // Agenda

    // Filter proposed dates with the one already scheduled, in case it changed
    private buildPossibleAgenda() {
        this.availableDates = new Array();

        if (Comparator.isEmpty(this.applicant.agenda) || !Comparator.equals(this.applicant.status, this.RESOURCES.APPLICANT.STATUS.NEW)) {
            this.availableDatesLoaded = true;
            return;
        }

        const promises = new Array();
        promises.push(this.appointmentService.getAlreadyScheduledAppointmentsWithAttendance(this.applicant.item._id, this.item.appointment._id, this.item.appointment.attendance));
        promises.push(this.appointmentService.getMyApplicants(this.applicant.user._id));

        forkJoin(promises).subscribe(
            (data: number[][]) => {
                const alreadyScheduled: number[] = Comparator.hasElements(data) ? data[0] : null;
                const applicantAlreadyScheduled: number[] = Comparator.hasElements(data) && data.length > 1 ? data[1] : new Array();

                this.buildAvailableDates(alreadyScheduled, applicantAlreadyScheduled);
                this.availableDatesLoaded = true;
            }
        );
    }

    private buildAvailableDates(alreadyScheduled: number[], applicantAlreadyScheduled: number[]) {
        const now: Date = new Date();
        const later: Date = moment(now).add(this.RESOURCES.APPOINTMENT.DISPLAY.DELAY_BEFORE_FIRST_VIEWING, 'h').toDate();

        if (!Comparator.isEmpty(alreadyScheduled)) {
            for (let i: number = 0; i < this.applicant.agenda.length; i++) {
                if (this.applicant.agenda[i].status === this.RESOURCES.APPLICANT.AGENDA.STATUS.NEW) {
                    const when: Date = Converter.getDateObj(this.applicant.agenda[i].when);

                    if (alreadyScheduled.indexOf(when.getTime()) === -1 && when.getTime() > later.getTime() && applicantAlreadyScheduled.indexOf(when.getTime()) === -1) {
                        this.availableDates.push(when.getTime());
                    }
                }
            }
        } else {
            for (let i: number = 0; i < this.applicant.agenda.length; i++) {
                if (this.applicant.agenda[i].status === this.RESOURCES.APPLICANT.AGENDA.STATUS.NEW) {
                    const tmp: Date = Converter.getDateObj(this.applicant.agenda[i].when);

                    if (tmp.getTime() > later.getTime() && applicantAlreadyScheduled.indexOf(tmp.getTime()) === -1) {
                        this.availableDates.push(tmp.getTime());
                    }
                }
            }
        }
    }

    hasSelectedDates(): boolean {
        return Comparator.hasElements(this.availableDates);
    }

    private callCallback(updatedApplicant: Applicant) {
        const self: any = this;

        this.updateApplicantCallback(updatedApplicant, this.applicantIndex).then(() => {
            self.location.back();
        });
    }

    /**
     * We don't allow people to cancel their viewing in the app anymore once they have an appointment.
     * <br/>To be only use to cancel an applicant.
     */
    cancel(showReschedule: boolean) {
        const promises = new Array();
        promises.push(this.translateService.get('CORE.CANCEL'));
        promises.push(this.translateService.get('APPLICANT_SELECTION.ACTION_SHEET.ASK_RESCHEDULE'));
        promises.push(this.translateService.get('APPLICANT_SELECTION.ACTION_SHEET.FOUND_SOMEONE_ELSE'));
        promises.push(this.translateService.get('APPLICANT_SELECTION.ACTION_SHEET.NOT_ENOUGH_DETAILS'));
        promises.push(this.translateService.get('APPLICANT_SELECTION.ACTION_SHEET.NO_REASON'));

        forkJoin(promises).subscribe(
            async (data: string[]) => {
                if (!Comparator.isEmpty(data) && data.length === promises.length) {
                    const myButtons: any = new Array();

                    if (this.isStatusNew() && !this.hasSelectedDates() && showReschedule) {
                        myButtons.push({
                            text: data[1],
                            role: 'destructive',
                            handler: () => {
                                this.reschedule();
                            }
                        });
                    }

                    myButtons.push({
                        text: data[2],
                        handler: async () => {
                            await this.declineWithReason(this.RESOURCES.APPLICANT.CANCELLATION.REASON.FOUND_SOMEONE_ELSE);
                        }
                    });

                    myButtons.push({
                        text: data[3],
                        handler: async () => {
                            await this.declineWithReason(this.RESOURCES.APPLICANT.CANCELLATION.REASON.NOT_ENOUGH_DETAILS);
                        }
                    });

                    myButtons.push({
                        text: data[4],
                        handler: async () => {
                            await this.declineWithReason(this.RESOURCES.APPLICANT.CANCELLATION.REASON.NO_REASON);
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

    private async declineWithReason(reason: string) {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.ADS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.APPLICANT.APPLICANT_DECLINE);

        this.applicant.cancellation = new ApplicantCancellation(reason);

        await this.updateApplication(this.RESOURCES.APPLICANT.STATUS.CANCELLED, null);
    }

    isStatusNew(): boolean {
        return this.applicant != null && Comparator.equals(this.RESOURCES.APPLICANT.STATUS.NEW, this.currentStatus);
    }

    isStatusAccepted(): boolean {
        return this.applicant != null && Comparator.equals(this.RESOURCES.APPLICANT.STATUS.ACCEPTED, this.currentStatus);
    }

    isStatusCancelled(): boolean {
        return this.applicant != null && Comparator.equals(this.RESOURCES.APPLICANT.STATUS.CANCELLED, this.currentStatus);
    }

    isStatusToReschedule(): boolean {
        return this.applicant != null && Comparator.equals(this.RESOURCES.APPLICANT.STATUS.TO_RESCHEDULE, this.currentStatus);
    }

    isAppointmentInThePast(): boolean {
        return this.applicant != null && new Date().getTime() >= Converter.getDateObj(this.applicant.selected).getTime();
    }

    displaySensitive(): boolean {
        return this.applicant != null && Comparator.equals(this.RESOURCES.APPLICANT.STATUS.ACCEPTED, this.applicant.status);
    }

    async openApplicantAppointmentsModal(newCategory?: string) {
        if (!this.hasSelectedDates()) {
            return;
        }

        const modal: HTMLIonModalElement = await this.modalController.create({
            component: ApplicantAppointmentsModal,
            componentProps: {
                applicant: this.applicant,
                availableDates: this.availableDates,
                item: this.item
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            if (!Comparator.isEmpty(detail) && !Comparator.isEmpty(detail.data)) {
                this.callCallback(detail.data);
            }

            if (!Comparator.isStringEmpty(newCategory)) {
                this.category = newCategory;
            }
        });

        await modal.present();
    }

    doReschedule() {
        if (this.isStatusNew() && !this.hasSelectedDates()) {
            this.reschedule();
        }
    }

    protected finishUpdateApplication(updatedApplicant: Applicant) {
        this.callCallback(updatedApplicant);
    }

    displayChoices() {
        const promises = new Array();
        promises.push(this.translateService.get('CORE.CANCEL'));
        promises.push(this.translateService.get('APPLICANT_SELECTION.ACTION_SHEET.ACCEPT'));
        promises.push(this.translateService.get('APPLICANT_SELECTION.ACTION_SHEET.DECLINE'));
        promises.push(this.translateService.get('APPLICANT_SELECTION.ACTION_SHEET.COMPLAIN'));
        promises.push(this.translateService.get('APPLICANT_SELECTION.ACTION_SHEET.ASK_RESCHEDULE'));

        forkJoin(promises).subscribe(
            async (data: string[]) => {
                if (!Comparator.isEmpty(data) && data.length === promises.length) {
                    const myButtons: any = new Array();

                    if (this.isStatusNew() && this.hasSelectedDates()) {
                        myButtons.push({
                            text: data[1],
                            role: 'destructive',
                            handler: () => {
                                this.openApplicantAppointmentsModal();
                            }
                        });
                    }

                    if (this.isStatusNew() && !this.hasSelectedDates()) {
                        myButtons.push({
                            text: data[4],
                            role: 'destructive',
                            handler: () => {
                                this.reschedule();
                            }
                        });
                    }

                    if (this.isStatusNew()) {
                        myButtons.push({
                            text: data[2],
                            handler: () => {
                                this.cancel(false);
                            }
                        });
                    }

                    myButtons.push({
                        text: data[3],
                        handler: () => {
                            this.presentComplaints();
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

                    await actionSheet.present();
                }
            }
        );
    }

    private presentComplaints() {
        const promises = new Array();
        promises.push(this.translateService.get('COMPLAINT.TITLE'));
        promises.push(this.translateService.get('COMPLAINT.INAPPROPRIATE'));
        promises.push(this.translateService.get('COMPLAINT.FAKE'));
        promises.push(this.translateService.get('CORE.CANCEL'));
        promises.push(this.translateService.get('CORE.OK'));
        promises.push(this.translateService.get('COMPLAINT.DIDNT_SHOW_UP'));

        forkJoin(promises).subscribe(
            async (data: string[]) => {
                if (!Comparator.isEmpty(data) && data.length === promises.length) {

                    const inputs = new Array();

                    inputs.push({
                        type: 'radio',
                        label: data[1],
                        value: this.RESOURCES.COMPLAINT.INAPPROPRIATE,
                        checked: true
                    });

                    inputs.push({
                        type: 'radio',
                        label: data[2],
                        value: this.RESOURCES.COMPLAINT.FAKE,
                        checked: false
                    });

                    if (!this.isStatusNew() && !this.isStatusCancelled()) {
                        inputs.push({
                            type: 'radio',
                            label: data[5],
                            value: this.RESOURCES.COMPLAINT.DIDNT_SHOW_UP,
                            checked: false
                        });
                    }

                    const alert: HTMLIonAlertElement = await this.alertController.create({
                        header: data[0],
                        inputs: inputs,
                        buttons: [
                            {
                                text: data[3],
                                role: 'cancel'
                            },
                            {
                                text: data[4],
                                handler: (choice: string) => {
                                    this.createComplaint(choice);
                                }
                            }
                        ]
                    });

                    await alert.present();
                }
            }
        );
    }

    private createComplaint(reason: string) {
        this.complaintService.userComplaint(this.applicant.user, reason).then((result: boolean) => {
            // Do nothing
        }, async (response: HttpErrorResponse) => {
            await this.errorMsg(this.toastController, this.translateService, 'ERRORS.ITEM_DETAILS.COMPLAINT');
        });
    }

    setUserProfileLoaded(value: boolean) {
        this.userProfileLoaded = value;
    }

}
