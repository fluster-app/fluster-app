import {
    Component, Input, Output, EventEmitter, ViewChild, OnChanges,
    SimpleChange, ElementRef
} from '@angular/core';

import * as moment from 'moment';

// Abstract
import {AbstractPickAppointments} from '../../core/pick-appointments/abstract-pick-appointments';

// Model
import {Item} from '../../../services/model/item/item';
import {Appointment} from '../../../services/model/appointment/appointment';

// Resources and utils
import {Comparator} from '../../../services/core/utils/utils';
import {PickAppointmentExistingDates, PickAppointmentTime} from '../../../services/model/utils/pickAppointments';

// Services
import {AppointmentService} from '../../../services/core/appointment/appointment-service';

@Component({
    templateUrl: 'pick-ads-appointments.html',
    styleUrls: ['./pick-ads-appointments.scss'],
    selector: 'app-pick-ads-appointments'
})
export class PickAdsAppointmentsComponent extends AbstractPickAppointments implements OnChanges {

    @ViewChild('datePickerScrollX', {read: ElementRef}) scrollX: ElementRef;
    @ViewChild('datePickerScrollY', {read: ElementRef}) scrollY: ElementRef;

    @Output() notifiySelected: EventEmitter<number[]> = new EventEmitter<number[]>();

    @Input() item: Item;
    @Input() appointment: Appointment;

    unavailableAppointmentDates: number[];

    // Output
    selectedAppointmentsStartTime: number[];

    constructor(private appointmentService: AppointmentService) {
        super();
        this.onlySelectedDates = false;
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (Comparator.isEmpty(this.selectedDates)) {

            this.onlySelectedDates = false;

            this.appointmentService.buildExistingDates(this.item, this.appointment).then((result: PickAppointmentExistingDates) => {
                this.selectedAppointmentsStartTime = result.scheduledDates != null ? result.scheduledDates : new Array();
                this.selectedDates = result.scheduledDates != null ? result.scheduledDates : new Array();
                this.unavailableAppointmentDates = result.unavailableAppointmentDates;

                this.emitSelectedDates();

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
        if (this.isAppointmentAlreadyTaken(currentAppointment)) {
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

        if (!this.isInTheFuture(selectedAppointment) &&
            this.selectedAppointmentsStartTime.indexOf(selectedAppointment.startTime.getTime()) === -1) {
            return;
        }

        if (!this.selectedAppointmentsStartTime) {
            return;
        }

        if (this.selectedAppointmentsStartTime.indexOf(selectedAppointment.startTime.getTime()) > -1) {
            const index: number = this.selectedAppointmentsStartTime.indexOf(selectedAppointment.startTime.getTime());
            this.selectedAppointmentsStartTime.splice(index, 1);
            selectedAppointment.selected = false;

            this.isCurrentAppointmentDateSelected().then((isSelected: boolean) => {
                this.currentPickAppointmentDate.selected = isSelected;
            });
        } else {
            this.selectedAppointmentsStartTime.push(selectedAppointment.startTime.getTime());
            selectedAppointment.selected = true;

            this.currentPickAppointmentDate.selected = true;
        }

        this.emitSelectedDates();
    }

    private emitSelectedDates() {
        this.notifiySelected.emit(this.selectedAppointmentsStartTime);
    }

    private isCurrentAppointmentDateSelected(): Promise<{}> {
        return new Promise((resolve) => {
            let result: boolean = false;

            for (let i: number = 0; i < this.selectedAppointmentsStartTime.length; i++) {
                const tmp: Date = new Date(this.selectedAppointmentsStartTime[i]);

                if (this.currentPickAppointmentDate.pickDate.getTime() === moment(tmp).startOf('day').toDate().getTime()) {
                    result = true;
                }
            }

            resolve(result);
        });
    }

    swipeDatePicker($event: any) {
        this.swipeCard($event, this.scrollX.nativeElement);
    }

}
