import {forkJoin} from 'rxjs/internal/observable/forkJoin';

import * as moment from 'moment';

// Utils
import {Resources} from '../../../services/core/utils/resources';
import {PickAppointmentDate, PickAppointmentTime} from '../../../services/model/utils/pickAppointments';
import {Comparator} from '../../../services/core/utils/utils';

export abstract class AbstractPickAppointments {

    RESOURCES: any = Resources.Constants;

    pickAppointmentDate: PickAppointmentDate[];
    pickAppointmentTime: PickAppointmentTime[];

    currentAppointments: PickAppointmentTime[];

    protected selectedDates: number[];
    protected onlySelectedDates: boolean = true;

    protected currentPickAppointmentDate: PickAppointmentDate;
    protected currentPickAppointmentDateIndex: number;

    protected highlightSpecialTime: number;

    protected init(): void {
        this.pickAppointmentDate = new Array();
        this.pickAppointmentTime = new Array();

        const today: Date = new Date();
        const tomorrow: Date = moment(today).add(1, 'd').toDate();

        const maxTimeTillNextDay: number = this.RESOURCES.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.EVENING.FIRST_START_TIME_HOURS +
            this.RESOURCES.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.EVENING.COUNT -
            this.RESOURCES.APPOINTMENT.DISPLAY.DELAY_BEFORE_FIRST_VIEWING - 1;

        this.initPickAppointments(today.getHours() < maxTimeTillNextDay ? today : tomorrow).then(() => {
            if (Comparator.hasElements(this.pickAppointmentTime)) {
                this.initFirstPickDate().then((index: number) => {
                    if (index != null) {

                        this.selectDate(this.pickAppointmentDate[index], index);

                        setTimeout(() => {
                            this.initScrollX(index);

                            this.initScrollY();

                            this.postInit();
                        }, 20);
                    }
                });
            }
        });
    }

    protected abstract initScrollX(index: number);

    protected abstract initScrollY();

    protected abstract postInit();

    private initFirstPickDate(): Promise<{}> {
        return new Promise((resolve, reject) => {
            if (Comparator.isEmpty(this.pickAppointmentDate)) {
                reject();
            } else {
                for (let i: number = 0; i < this.pickAppointmentDate.length; i++) {
                    if (this.pickAppointmentDate[i].pickDate != null && !this.onlySelectedDates) {
                        // If we display all dates, we show today or tomorrow according the time of the day
                        resolve(i);
                    }
                    if (this.pickAppointmentDate[i].pickDate != null && this.onlySelectedDates && this.pickAppointmentDate[i].hasTimeSlot) {
                        // If we display only the favorites dates, then we select the first favorites
                        resolve(i);
                    }
                }

                resolve(null);
            }
        });
    }

    protected initPickAppointments(startDay: Date): Promise<{}> {
        return new Promise((resolve) => {
            // Reset date to begin of the day
            startDay = moment(startDay).startOf('day').toDate();

            const day: number = moment(startDay).day();
            let size: number = day === 0 ? this.RESOURCES.APPOINTMENT.DISPLAY.ALL_WEEK - 1 : day - 1;

            let maxTodayTime: number = (this.RESOURCES.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.EVENING.FIRST_START_TIME_HOURS +
                this.RESOURCES.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.EVENING.COUNT) - 1;
            maxTodayTime = maxTodayTime - this.RESOURCES.APPOINTMENT.DISPLAY.DELAY_BEFORE_FIRST_VIEWING;

            if (new Date().getHours() >= maxTodayTime) {
                // If we pass the last time before it's possible to do an appointment today, then the first gonna be tomorrow
                size++;

                this.pickAppointmentDate.push({
                    pickDate: null,
                    displayDate: this.formateDisplayDate(new Date()),
                    selected: false,
                    hasTimeSlot: false
                });
            }

            const promises = new Array();

            let iterateFirstWeek: Date;

            // First week
            for (let i: number = 0; i < this.RESOURCES.APPOINTMENT.DISPLAY.ALL_WEEK - size; i++) {
                iterateFirstWeek = moment(startDay).add(i, 'd').toDate();

                promises.push(this.pushPickAppointment(iterateFirstWeek));
            }

            // Other weeks
            const beginOfNextWeek: Date = moment(iterateFirstWeek).add(1, 'd').toDate();
            const countWeeksLeft: number = this.RESOURCES.APPOINTMENT.DISPLAY.MAX_COUNT_WEEKS - 1; // - the first week
            const daysToAddToCalendar: number = this.RESOURCES.APPOINTMENT.DISPLAY.ALL_WEEK * countWeeksLeft;

            for (let i: number = 0; i < daysToAddToCalendar; i++) {
                const tmp: Date = moment(beginOfNextWeek).add(i, 'd').toDate();

                promises.push(this.pushPickAppointment(tmp));
            }

            forkJoin(promises).subscribe(
                (data: PickAppointmentDate[]) => {
                    if (!Comparator.isEmpty(data)) {
                        for (let i: number = 0; i < data.length; i++) {
                            this.pickAppointmentDate.push(data[i]);
                        }
                    }
                    resolve();
                }
            );
        });
    }

    private pushPickAppointment(selectedDate: Date): Promise<{}> {
        return new Promise((resolve) => {

            const startTime: number = this.RESOURCES.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.MORNING.FIRST_START_TIME_HOURS;
            const endTime: number = startTime + this.RESOURCES.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.MORNING.COUNT +
                this.RESOURCES.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.AFTERNOON.COUNT +
                this.RESOURCES.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.EVENING.COUNT;

            let hasTimeSlot: boolean = false;
            let hasSelectedTime: boolean = false;

            for (let i: number = startTime; i < endTime; i++) {

                const startTimeElement: Date = new Date(selectedDate.toISOString());
                startTimeElement.setHours(i, 0, 0, 0);

                if ((this.onlySelectedDates && this.selectedDates != null &&
                    this.selectedDates.indexOf(startTimeElement.getTime()) > -1) || !this.onlySelectedDates) {

                    const time: PickAppointmentTime = {
                        pickDate: selectedDate,
                        filterIndex: this.pickAppointmentDate.length === 0 ? 0 :
                            Math.floor(this.pickAppointmentDate.length / this.RESOURCES.APPOINTMENT.DISPLAY.ALL_WEEK) *
                            this.RESOURCES.APPOINTMENT.DISPLAY.ALL_WEEK,
                        startTime: startTimeElement,
                        selected: this.isAppointmentTimeSelected(startTimeElement),
                        highlighted: this.highlightSpecialTime != null && startTimeElement.getTime() === this.highlightSpecialTime
                    };

                    if (!hasTimeSlot) {
                        hasTimeSlot = true;
                    }

                    if (!hasSelectedTime && time.selected) {
                        hasSelectedTime = true;
                    }

                    this.pickAppointmentTime.push(time);
                }
            }

            resolve({
                pickDate: selectedDate,
                displayDate: this.formateDisplayDate(selectedDate),
                selected: hasSelectedTime,
                hasTimeSlot: hasTimeSlot
            });
        });
    }

    private isAppointmentTimeSelected(startTimeElement: Date): boolean {
        return (!this.onlySelectedDates && this.selectedDates != null &&
            this.selectedDates.indexOf(startTimeElement.getTime()) > -1);
    }

    private formateDisplayDate(toFormat: Date): string {
        return '' + moment(toFormat).format('Do') + ' ' + moment(toFormat).format('MMM');
    }

    selectDate(selected: PickAppointmentDate, selectedIndex: number) {
        if (selected.pickDate == null) {
            return;
        }

        if (this.onlySelectedDates && !selected.hasTimeSlot) {
            return;
        }

        this.currentPickAppointmentDate = selected;
        this.currentPickAppointmentDateIndex = selectedIndex;

        this.filterAppointmentTimesForDate(selected.pickDate).then((relatedTimes: PickAppointmentTime[]) => {
            this.currentAppointments = relatedTimes;
        });
    }

    private filterAppointmentTimesForDate(selected: Date): Promise<{}> {
        return new Promise((resolve) => {
            const relatedTimes: PickAppointmentTime[] = new Array();

            for (let i: number = 0; i < this.pickAppointmentTime.length; i++) {

                if (this.pickAppointmentTime[i].pickDate.getTime() === selected.getTime()) {
                    relatedTimes.push(this.pickAppointmentTime[i]);
                }
            }

            resolve(relatedTimes);
        });
    }

    isSelectedDate(pickedAppoinment: PickAppointmentDate): boolean {
        if (pickedAppoinment == null || pickedAppoinment.pickDate == null ||
            this.currentPickAppointmentDate == null || this.currentPickAppointmentDate.pickDate == null) {
            return false;
        }

        return pickedAppoinment.pickDate.getTime() === this.currentPickAppointmentDate.pickDate.getTime();
    }

    isDisabledDate(pickedAppoinment: PickAppointmentDate): boolean {
        return pickedAppoinment == null || pickedAppoinment.pickDate == null || (this.onlySelectedDates && !pickedAppoinment.hasTimeSlot);
    }

    protected swipeCard($event: any, scrollElement: HTMLElement) {
        if ($event != null && !Comparator.isEmpty(this.pickAppointmentTime)) {
            if (this.onlySelectedDates) {
                this.findNextDateTimeSlot(this.currentPickAppointmentDateIndex, $event.deltaX <= 0).then((index: number) => {
                    if (index != null) {
                        this.selectDate(this.pickAppointmentDate[index], index);
                        this.moveScroll(scrollElement, index);
                    }
                });
            } else {
                this.swipeCardAllDates($event, scrollElement);
            }
        }
    }

    private swipeCardAllDates($event: any, scrollElement: HTMLElement) {
        if ($event.deltaX > 0 && this.isPrevPickAllowed()) {
            this.currentPickAppointmentDateIndex--;
            this.selectDate(this.pickAppointmentDate[this.currentPickAppointmentDateIndex], this.currentPickAppointmentDateIndex);
        } else if ($event.deltaX <= 0 && this.isNextPickAllowed()) {
            this.currentPickAppointmentDateIndex++;
            this.selectDate(this.pickAppointmentDate[this.currentPickAppointmentDateIndex], this.currentPickAppointmentDateIndex);
        }

        this.moveScroll(scrollElement, this.currentPickAppointmentDateIndex);
    }

    private findNextDateTimeSlot(startIndex: number, forward: boolean): Promise<{}> {
        return new Promise((resolve) => {
            if (Comparator.isEmpty(this.pickAppointmentDate)) {
                resolve(null);
            } else {
                if (forward) {
                    for (let i: number = startIndex + 1; i < this.pickAppointmentDate.length; i++) {
                        if (this.pickAppointmentDate[i].hasTimeSlot) {
                            resolve(i);
                        }
                    }
                } else {
                    for (let i: number = startIndex - 1; i >= 0; i--) {
                        if (this.pickAppointmentDate[i].hasTimeSlot) {
                            resolve(i);
                        }
                    }
                }

                resolve(null);
            }
        });
    }

    private isPrevPickAllowed(): boolean {
        return !Comparator.isEmpty(this.pickAppointmentDate) && this.currentPickAppointmentDateIndex > 0
            && this.pickAppointmentDate[this.currentPickAppointmentDateIndex - 1].pickDate != null;
    }

    private isNextPickAllowed(): boolean {
        return !Comparator.isEmpty(this.pickAppointmentDate) && this.currentPickAppointmentDateIndex < (this.pickAppointmentDate.length - 1)
            && this.pickAppointmentDate[this.currentPickAppointmentDateIndex + 1].pickDate != null;
    }

    isInTheFuture(currentAppointment: PickAppointmentTime): boolean {
        const future: Date = moment(new Date()).add(this.RESOURCES.APPOINTMENT.DISPLAY.DELAY_BEFORE_FIRST_VIEWING, 'h').toDate();

        return currentAppointment.startTime.getTime() >= future.getTime();
    }

    protected moveScroll(scrollElement: HTMLElement, index: number) {
        const scrollWidth: number = scrollElement.scrollWidth / this.pickAppointmentDate.length;

        scrollElement.scrollLeft = (index - this.RESOURCES.APPOINTMENT.DISPLAY.SCROLL_MIDDLE_INDEX) * scrollWidth;
    }

    protected moveScrollY(scrollElement: HTMLElement) {
        if (Comparator.isEmpty(this.pickAppointmentDate) || Comparator.isEmpty(this.pickAppointmentTime)) {
            return;
        }

        // Scroll till begin of evening period
        // This ratio is acceptable for selected dates too
        const scrollRatio: number = (this.RESOURCES.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.MORNING.COUNT +
            this.RESOURCES.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.AFTERNOON.COUNT) /
            (this.RESOURCES.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.MORNING.COUNT +
                this.RESOURCES.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.AFTERNOON.COUNT +
                this.RESOURCES.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.EVENING.COUNT);

        scrollElement.scrollTop = scrollElement.scrollHeight * scrollRatio;
    }
}
