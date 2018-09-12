import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Platform, Slides} from '@ionic/angular';

// Model
import {Appointment} from '../../../../services/model/appointment/appointment';
import {Item} from '../../../../services/model/item/item';

// Abstract
import {AbstractNewAdComponent} from '../abstract-new-ad';

// Services
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'new-ad-step-appointments.html',
    styleUrls: ['./new-ad-step-appointments.scss'],
    selector: 'app-new-ad-step-appointments'
})
export class NewAdStepAppointmentsComponent extends AbstractNewAdComponent {

    item: Item;
    appointment: Appointment;

    @Output() notifyPrev: EventEmitter<{}> = new EventEmitter<{}>();

    @Output() notifyNext: EventEmitter<{}> = new EventEmitter<{}>();

    @Input() slider: Slides;

    updatedSchedule: number[];

    constructor(private platform: Platform,
                protected newItemService: NewItemService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(newItemService);

        this.item = this.newItemService.getNewItem();
        this.appointment = this.newItemService.getNewAppointment();
    }

    select(selectedDates: number[]) {
        this.updatedSchedule = selectedDates;
    }

    async next() {
        if (this.appointment == null) {
            const appointment: Appointment = new Appointment();
            appointment.item = this.item;
            appointment.type = this.RESOURCES.APPOINTMENT.TYPE.FIXED;
            appointment.attendance = this.RESOURCES.APPOINTMENT.ATTENDANCE.SINGLE;
            appointment.approval = this.RESOURCES.APPOINTMENT.APPROVAL.SELECT;

            this.newItemService.setNewAppointment(appointment);
        }

        this.newItemService.setNewAppointmentSchedule(this.updatedSchedule);

        this.notifyNext.emit();

        await this.slider.slideNext();

        this.gaTrackEventOnce(this.platform, this.googleAnalyticsNativeService,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.STEP_APPOINTMENTS);
    }

    swipeSlide($event: any) {
        if ($event != null) {
            if ($event.deltaX > 0) {
                // Prev
                this.notifyPrev.emit();
            } else if ($event.deltaX <= 0) {
                // Next
                this.next();
            }
        }
    }
}
