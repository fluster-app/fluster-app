import {Component} from '@angular/core';
import {ModalController, NavParams, Platform} from '@ionic/angular';

import * as moment from 'moment';

// Modal
import {AbstractWizardModal} from '../abstract-wizard-modal';

// Utils
import {Converter} from '../../../services/core/utils/utils';

// Services
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';

export interface CalendarDate {
    day: number;
    month: number;
    year: number;
    enabled: boolean;
    today: boolean;
    selected: boolean;
    clicked: boolean;
}

@Component({
    templateUrl: 'date-picker.html',
    styleUrls: ['./date-picker.scss'],
    selector: 'app-date-picker'
})
export class DatePickerModal extends AbstractWizardModal {

    initDate: moment.Moment = moment();

    // If once we would like to use Sunday as first day of the week
    private firstWeekdaySunday: boolean = false;

    days: CalendarDate[];

    private value: Date;

    constructor(protected platform: Platform,
                private navParams: NavParams,
                private modalController: ModalController,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(platform);

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.DATE_PICKER);
    }

    ionViewWillEnter() {
        this.checkAdDisplayParams(this.navParams);

        this.value = Converter.getDateObj(this.navParams.get('value'));

        this.initDate = this.value != null ? moment(this.value) : moment(this.initDate);

        this.generateCalendar();
    }

    generateCalendar() {
        const month: number = this.initDate.month();
        const year: number = this.initDate.year();
        const firstWeekDay: number = (this.firstWeekdaySunday) ? this.initDate.date(2).day() : this.initDate.date(1).day();
        let n: number = 1;

        if (firstWeekDay !== 1) {
            n -= (firstWeekDay + 6) % 7;
        }

        this.days = new Array();
        const selectedDate: any = moment(this.value);
        for (let i = n; i <= this.initDate.endOf('month').date(); i += 1) {
            const currentDate = moment(`${i}.${month + 1}.${year}`, 'DD.MM.YYYY');
            const today = (moment().isSame(currentDate, 'day') && moment().isSame(currentDate, 'month')) ? true : false;
            const selected = (selectedDate.isSame(currentDate, 'day')) ? true : false;

            if (i > 0) {
                this.days.push({
                    day: i,
                    month: month + 1,
                    year: year,
                    enabled: true,
                    today: today,
                    selected: selected,
                    clicked: false
                });
            } else {
                this.days.push({
                    day: null,
                    month: null,
                    year: null,
                    enabled: false,
                    today: false,
                    selected: selected,
                    clicked: false
                });
            }
        }
    }

    selectDate(e: MouseEvent, i: number, d: CalendarDate) {
        e.preventDefault();

        d.clicked = true;

        const selectedCalendarDate: CalendarDate = this.days[i];
        const selectedDate: Date = moment(`${selectedCalendarDate.day}.${selectedCalendarDate.month}.${selectedCalendarDate.year}`, 'DD.MM.YYYY').toDate();
        this.dismiss(selectedDate);
    }

    // private
    dismiss(selectedDate: Date) {
        this.modalController.dismiss(selectedDate).then(() => {
            // Do nothing
        });
    }

    close() {
        this.dismiss(null);
    }

    prevMonth() {
        this.initDate = this.initDate.subtract(1, 'month');
        this.generateCalendar();
    }

    nextMonth() {
        this.initDate = this.initDate.add(1, 'month');
        this.generateCalendar();
    }

    swipeSlide($event: any) {
        if ($event != null) {
            if ($event.deltaX > 0) {
                this.prevMonth();
            } else {
                this.nextMonth();
            }
        }
    }
}
