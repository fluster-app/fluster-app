import {
    Component, Input, Output, EventEmitter, ViewChild, OnChanges,
    SimpleChange, ElementRef
} from '@angular/core';

import * as moment from 'moment';

// Abstract
import {AbstractPickAppointments} from '../../core/pick-appointments/abstract-pick-appointments';

// Resources and utils
import {Comparator} from '../../../services/core/utils/utils';
import {PickAppointmentTime} from '../../../services/model/utils/pickAppointments';

// Services
import {AdminScheduledDates} from '../../../services/core/appointment/admin-appoinments-service';

@Component({
    templateUrl: 'pick-ads-appointments.html',
    styleUrls: ['./pick-ads-appointments.scss'],
    selector: 'app-pick-ads-appointments'
})
export class PickAdsAppointmentsComponent extends AbstractPickAppointments implements OnChanges {

    @ViewChild('datePickerScrollX', {read: ElementRef}) scrollX: ElementRef;
    @ViewChild('datePickerScrollY', {read: ElementRef}) scrollY: ElementRef;

    @Output() notifiySelected: EventEmitter<number[]> = new EventEmitter<number[]>();

    @Input() adminScheduledDates: AdminScheduledDates;

    unavailableAppointmentDates: number[];
    selectedAppointmentsStartTime: number[];

    constructor() {
        super();
        this.onlySelectedDates = false;
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (Comparator.isEmpty(this.selectedDates) && !Comparator.isEmpty(this.adminScheduledDates)) {
            this.onlySelectedDates = false;

            this.selectedAppointmentsStartTime = this.adminScheduledDates.selectedAppointmentsStartTime;
            this.selectedDates = this.adminScheduledDates.selectedDates;
            this.unavailableAppointmentDates = this.adminScheduledDates.unavailableAppointmentDates;

            this.emitSelectedDates();

            this.init();
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
            return 'calendar';
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
