import {
    Component, Input, Output, EventEmitter, ViewChild, OnChanges,
    SimpleChange, ElementRef
} from '@angular/core';
import {AlertController} from '@ionic/angular';

import {TranslateService} from '@ngx-translate/core';

// Abstract
import {AbstractPickAppointments} from '../../core/pick-appointments/abstract-pick-appointments';

// Resources and utils
import {Comparator} from '../../../services/core/utils/utils';
import {PickAppointmentTime, PickAppointmentDate} from '../../../services/model/utils/pickAppointments';

@Component({
    templateUrl: 'pick-applicant-appointments.html',
    styleUrls: ['./pick-applicant-appointments.scss'],
    selector: 'app-pick-applicant-appointments'
})
export class PickApplicantAppointmentsComponent extends AbstractPickAppointments implements OnChanges {

    @ViewChild('datePickerScrollX', {read: ElementRef}) scrollX: ElementRef;
    @ViewChild('datePickerScrollY', {read: ElementRef}) scrollY: ElementRef;

    @Output() notifiySelected: EventEmitter<Date> = new EventEmitter<Date>();

    @Input() selectedApplicantDates: number[];

    private previousSelectedPickAppointmentDate: PickAppointmentDate;
    private previousSelectedAppointment: PickAppointmentTime;

    selectedAppointmentsStartTime: Date;

    constructor(private alertController: AlertController,
                private translateService: TranslateService) {
        super();
        this.onlySelectedDates = true;
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (this.selectedApplicantDates != null) {

            this.onlySelectedDates = true;
            this.selectedDates = this.selectedApplicantDates;

            this.init();
        }
    }

    protected initScrollY() {
        this.moveScrollY(this.scrollY.nativeElement);
    }

    protected postInit() {
        // Do nothing
    }

    selectAppointment() {
        if (!this.isAppointmentSelected()) {
            this.displayAlertAtLeastOneAppointment();
        } else {
            this.notifiySelected.emit(this.selectedAppointmentsStartTime);
        }
    }

    private async displayAlertAtLeastOneAppointment() {
        const header: string = this.translateService.instant('APPLICANT_SELECTION.NO_SELECTED_TIME');
        const ok: string = this.translateService.instant('CORE.OK');

        const alert: HTMLIonAlertElement = await this.alertController.create({
            header: header,
            buttons: [ok]
        });

        await alert.present();
    }

    selectUnselectAppointment(selectedAppointment: PickAppointmentTime) {
        if (this.previousSelectedPickAppointmentDate != null) {
            this.previousSelectedPickAppointmentDate.selected = false;
        }

        if (this.previousSelectedAppointment != null) {
            this.previousSelectedAppointment.selected = false;
        }

        this.selectedAppointmentsStartTime = selectedAppointment.startTime;

        this.currentPickAppointmentDate.selected = true;
        this.previousSelectedPickAppointmentDate = this.currentPickAppointmentDate;

        selectedAppointment.selected = true;
        this.previousSelectedAppointment = selectedAppointment;
    }

    protected initScrollX(index: number) {
        if (Comparator.hasElements(this.pickAppointmentTime)) {
            this.moveScroll(this.scrollX.nativeElement, index);
        }
    }

    swipeDatePicker($event: any) {
        this.swipeCard($event, this.scrollX.nativeElement);
    }

    isAppointmentSelected(): boolean {
        return this.selectedAppointmentsStartTime != null;
    }

}
