import {
    Component, Input, Output, EventEmitter, ViewChild, OnChanges,
    SimpleChange, ElementRef
} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

// Abstract
import {AbstractPickAppointments} from '../../core/pick-appointments/abstract-pick-appointments';

// Model
import {Item} from '../../../services/model/item/item';
import {Appointment} from '../../../services/model/appointment/appointment';
import {Applicant} from '../../../services/model/appointment/applicant';

// Resources and utils
import {Comparator, Converter} from '../../../services/core/utils/utils';
import {PickAppointmentDate, PickAppointmentTime} from '../../../services/model/utils/pickAppointments';

// Services
import {AppointmentService} from '../../../services/core/appointment/appointment-service';

@Component({
    templateUrl: 'pick-reschedule-appointments.html',
    styleUrls: ['./pick-reschedule-appointments.scss'],
    selector: 'app-pick-reschedule-appointments'
})
export class PickRescheduleAppointmentsComponent extends AbstractPickAppointments implements OnChanges {

    @ViewChild('datePickerScrollX', {read: ElementRef}) scrollX: ElementRef;
    @ViewChild('datePickerScrollY', {read: ElementRef}) scrollY: ElementRef;

    @Output() notifiySelected: EventEmitter<Date> = new EventEmitter<Date>();

    @Input() item: Item;
    @Input() appointment: Appointment;
    @Input() applicant: Applicant;

    unavailableAppointmentDates: number[];

    private previousSelectedPickAppointmentDate: PickAppointmentDate;
    private previousSelectedAppointment: PickAppointmentTime;

    // Output
    selectedAppointmentsStartTime: Date;

    constructor(private appointmentService: AppointmentService) {
        super();
        this.onlySelectedDates = false;
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (Comparator.isEmpty(this.selectedDates) && !Comparator.isEmpty(this.item) && !Comparator.isEmpty(this.appointment)) {
            this.onlySelectedDates = false;
            this.highlightSpecialTime = this.getApplicantSelected();

            this.selectedDates = new Array();

            this.appointmentService.getAlreadyScheduledAppointmentsWithAttendance(this.item._id,
                this.appointment._id, this.appointment.attendance).then((results: number[]) => {
                this.unavailableAppointmentDates = results;

                this.init();
            }, (errorResponse: HttpErrorResponse) => {
                // Init without unavailable dates
                this.unavailableAppointmentDates = null;

                this.init();
            });
        }
    }

    protected initScrollX(index: number) {
        this.moveScroll(this.scrollX.nativeElement, index);
    }

    protected initScrollY() {
        this.moveScrollY(this.scrollY.nativeElement);
    }

    protected postInit() {
        // Do nothing
    }

    iconToDisplay(currentAppointment: PickAppointmentTime): string {
        if (currentAppointment.highlighted) {
            return 'flag';
        } else if (this.isAppointmentAlreadyTaken(currentAppointment)) {
            return 'lock';
        } else {
            return currentAppointment.selected ? 'checkmark-circle' : 'radio-button-off';
        }
    }

    isAppointmentAlreadyTaken(currentAppointment: PickAppointmentTime): boolean {
        return !Comparator.isEmpty(this.unavailableAppointmentDates) &&
            this.unavailableAppointmentDates.indexOf(currentAppointment.startTime.getTime()) > -1;
    }

    selectUnselectAppointment(selectedAppointment: PickAppointmentTime) {
        if (this.isAppointmentAlreadyTaken(selectedAppointment)) {
            return;
        }

        if (!this.isInTheFuture(selectedAppointment)) {
            return;
        }

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

        this.emitSelectedDates();
    }

    private emitSelectedDates() {
        this.notifiySelected.emit(this.selectedAppointmentsStartTime);
    }

    swipeDatePicker($event: any) {
        this.swipeCard($event, this.scrollX.nativeElement);
    }

    isAppointmentSelected(): boolean {
        return this.selectedAppointmentsStartTime != null;
    }

    private getApplicantSelected(): number {
        return !Comparator.isEmpty(this.applicant) && this.applicant.selected != null &&
            Converter.getDateObj(this.applicant.selected).getTime();
    }

}
