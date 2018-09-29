import {Component, Output, EventEmitter, Input} from '@angular/core';
import {Platform, Slides} from '@ionic/angular';

// Abstract
import {AbstractNewAdComponent} from '../abstract-new-ad';

// Model
import {Appointment} from '../../../../services/model/appointment/appointment';

// Services
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'new-ad-step-attendance.html',
    selector: 'app-new-ad-step-attendance'
})
export class NewAdStepAttendanceComponent extends AbstractNewAdComponent {

    @Output() notifyPrev: EventEmitter<{}> = new EventEmitter<{}>();

    @Output() notifiyPublishCall: EventEmitter<void> = new EventEmitter<void>();

    @Input() slider: Slides;

    isSinglePicked: boolean = false;
    isMultiplePicked: boolean = false;

    constructor(private platform: Platform,
                protected newItemService: NewItemService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(newItemService);
    }

    async swipeSlide($event: any) {
        if ($event != null) {
            if ($event.deltaX > 0) {
                // Prev
                this.notifyPrev.emit();
            } else if ($event.deltaX <= 0 && this.isNextSwipeAllowed()) {
                // Next
                await this.next();
            }
        }
    }

    private isNextSwipeAllowed(): boolean {
        return this.newItemService.isEdit() && !this.newItemService.isActivation();
    }

    private async next() {
        this.notifiyPublishCall.emit();

        this.gaTrackEventOnce(this.platform, this.googleAnalyticsNativeService,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.STEP_ATTENDANCE);
    }

    single() {
        this.isSinglePicked = true;

        this.setAttendanceAndNavigate();
    }

    multiple() {
        this.isMultiplePicked = true;

        this.setAttendanceAndNavigate();
    }

    private setAttendanceAndNavigate() {
        const appointment: Appointment = this.newItemService.getAndInitNewAppointment();

        if (this.isSinglePicked) {
            appointment.attendance = this.RESOURCES.APPOINTMENT.ATTENDANCE.SINGLE;
        } else if (this.isMultiplePicked) {
            appointment.attendance = this.RESOURCES.APPOINTMENT.ATTENDANCE.MULTIPLE;
        }

        this.newItemService.setNewAppointment(appointment);

        setTimeout(() => {
            this.next();

            // Reset if user comeback
            this.isSinglePicked = false;
            this.isMultiplePicked = false;
        }, 400);
    }
}
