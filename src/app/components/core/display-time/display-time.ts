import {Component, Input, OnChanges, SimpleChange} from '@angular/core';

@Component({
    templateUrl: 'display-time.html',
    styleUrls: ['./display-time.scss'],
    selector: 'app-display-time'
})
export class DisplayTimeComponent implements OnChanges {

    @Input() minutes: number;

    m: number = 0;
    h: number = 0;

    constructor() {
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (this.minutes == null || this.minutes <= 0) {
            return;
        }

        if (this.minutes < 60) {
            this.m = this.minutes;
            return;
        }

        this.m = this.minutes % 60;
        this.h = (this.minutes - this.m) / 60;
    }

}
