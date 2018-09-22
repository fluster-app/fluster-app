import {
    Component, Input, Output, EventEmitter, ViewChild, OnChanges,
    SimpleChange, ElementRef
} from '@angular/core';
import {AlertController} from '@ionic/angular';

import {forkJoin} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

// Resources and utils
import {Comparator} from '../../../services/core/utils/utils';
import {AbstractPickAppointments} from '../../core/pick-appointments/abstract-pick-appointments';
import {PickAppointmentTime} from '../../../services/model/utils/pickAppointments';

@Component({
    templateUrl: 'item-appointments-date-picker.html',
    styleUrls: ['./item-appointments-date-picker.scss'],
    selector: 'app-item-appointments-date-picker'
})
export class ItemAppointmentsDatePickerComponent extends AbstractPickAppointments implements OnChanges {

    @ViewChild('datePickerScrollX', {read: ElementRef}) scrollX: ElementRef;
    @ViewChild('datePickerScrollY', {read: ElementRef}) scrollY: ElementRef;

    @Output() notifiySelected: EventEmitter<number[]> = new EventEmitter<number[]>();

    @Input() favoriteDates: number[];
    @Input() unavailableAppointmentDates: number[];
    @Input() rejectedAppointmentDates: number[]; // In case of to_reschedule appointments

    // Output
    selectedAppointmentsStartTime: number[] = new Array();

    manyPossibleTimeSlots: boolean = true;
    manyPossibleDays: boolean = true;
    manyTimeSlotsSelected: boolean = false;
    manyDaysSelected: boolean = false;

    constructor(private alertController: AlertController,
                private translateService: TranslateService) {
        super();
        this.onlySelectedDates = false;
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (this.favoriteDates != null && this.unavailableAppointmentDates != null && this.rejectedAppointmentDates != null) {

            // If there is still favoriteDates in the future for the ad, display only these
            if (!Comparator.isEmpty(this.favoriteDates)) {
                this.onlySelectedDates = true;
                this.selectedDates = this.favoriteDates;
            }

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
        const promises = new Array();
        promises.push(this.hasManyPossibleTimeSlots());
        promises.push(this.hasManyPossibleDays());

        forkJoin(promises).subscribe(
            (data: boolean[]) => {
                this.manyPossibleTimeSlots = data[0];
                this.manyPossibleDays = data[1];
            }
        );
    }

    private hasManyPossibleTimeSlots(): Promise<{}> {
        return new Promise((resolve) => {
            if (!Comparator.hasElements(this.pickAppointmentTime)) {
                resolve(false);
            } else {
                let countSelected: number = 0;

                for (let i: number = 0; i < this.pickAppointmentTime.length; i++) {

                    if (!this.isAppointmentAlreadyTaken(this.pickAppointmentTime[i]) &&
                        !this.isAppointmentRejected(this.pickAppointmentTime[i])) {
                        countSelected++;
                    }

                    if (countSelected > 1) {
                        // We don't want to iterate thru a lot of elements, just to know if more than one active
                        break;
                    }
                }

                resolve(countSelected > 1);
            }
        });
    }

    private hasManyPossibleDays(): Promise<{}> {
        return new Promise((resolve) => {
            if (!Comparator.hasElements(this.pickAppointmentDate) || this.pickAppointmentDate.length <= 1) {
                resolve(false);
            } else {
                let countSelected: number = 0;

                for (let i: number = 0; i < this.pickAppointmentDate.length; i++) {
                    if (this.pickAppointmentDate[i].hasTimeSlot) {
                        countSelected++;
                    }
                }

                resolve(countSelected > 1);
            }
        });
    }

    selectAppointments() {
        if (this.hasSelectedAppointments()) {
            this.notifiySelected.emit(this.selectedAppointmentsStartTime);
        } else {
            this.displayAlertAtLeastOneAppointment();
        }
    }

    private async displayAlertAtLeastOneAppointment() {
        const header: string = this.translateService.instant('ITEM_APPOINTMENTS.SELECTED_COUNT.NO_SELECTED_BROWSE');
        const ok: string = this.translateService.instant('CORE.OK');

        const alert: HTMLIonAlertElement = await this.alertController.create({
            header: header,
            buttons: [ok]
        });

        await alert.present();
    }

    iconToDisplay(currentAppointment: PickAppointmentTime): string {
        if (this.isAppointmentAlreadyTaken(currentAppointment)) {
            return 'lock';
        } else if (this.isAppointmentRejected(currentAppointment)) {
            return 'close';
        } else {
            return 'basket';
        }
    }

    actionToDisplay(currentAppointment: PickAppointmentTime): string {
        if (this.isAppointmentAlreadyTaken(currentAppointment)) {
            return this.translateService.instant('ITEM_APPOINTMENTS.BUTTONS.LOCK');
        } else if (this.isAppointmentRejected(currentAppointment)) {
            return this.translateService.instant('ITEM_APPOINTMENTS.BUTTONS.REJECTED');
        } else {
            return this.translateService.instant('ITEM_APPOINTMENTS.BUTTONS.ADD');
        }
    }

    isAppointmentAlreadyTaken(currentAppointment: PickAppointmentTime): boolean {
        return !Comparator.isEmpty(this.unavailableAppointmentDates) &&
            this.unavailableAppointmentDates.indexOf(currentAppointment.startTime.getTime()) > -1;
    }

    isAppointmentRejected(currentAppointment: PickAppointmentTime): boolean {
        return !Comparator.isEmpty(this.rejectedAppointmentDates) &&
            this.rejectedAppointmentDates.indexOf(currentAppointment.startTime.getTime()) > -1;
    }

    selectUnselectAppointment(selectedAppointment: PickAppointmentTime) {
        if (!this.isInTheFuture(selectedAppointment) || this.isAppointmentAlreadyTaken(selectedAppointment)) {
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

        this.hasManyTimeSlotsSelected();

        this.hasManyAppointmentDaysSelected().then((result: boolean) => {
            this.manyDaysSelected = result;
        });
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

    private hasManyTimeSlotsSelected() {
        this.manyTimeSlotsSelected = Comparator.hasElements(this.selectedAppointmentsStartTime) &&
            this.selectedAppointmentsStartTime.length > (this.manyPossibleTimeSlots ? 1 : 0);
    }

    private hasManyAppointmentDaysSelected(): Promise<{}> {
        return new Promise((resolve) => {
            if (!Comparator.hasElements(this.selectedAppointmentsStartTime) || this.selectedAppointmentsStartTime.length <= 1) {
                resolve(this.manyPossibleTimeSlots ? false : this.selectedAppointmentsStartTime.length === 1);
            } else {
                let result: boolean = false;

                for (let i: number = 1; i < this.selectedAppointmentsStartTime.length; i++) {
                    const current: Date = new Date(this.selectedAppointmentsStartTime[i]);
                    const previous: Date = new Date(this.selectedAppointmentsStartTime[i - 1]);

                    if (moment(previous).startOf('day').toDate().getTime() !== moment(current).startOf('day').toDate().getTime()) {
                        result = true;
                        break;
                    }
                }

                resolve(result);
            }
        });
    }

    private hasSelectedAppointments(): boolean {
        return Comparator.hasElements(this.selectedAppointmentsStartTime);
    }

    swipeDatePicker($event: any) {
        this.swipeCard($event, this.scrollX.nativeElement);
    }

}
