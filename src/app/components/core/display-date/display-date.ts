import {Component, Input} from '@angular/core';

import * as moment from 'moment';

// Resources and utils
import {Converter} from '../../../services/core/utils/utils';

@Component({
    templateUrl: 'display-date.html',
    selector: 'app-display-date'
})
export class DisplayDateComponent {

    @Input() displayDate: Date;

    @Input() pattern: string = 'll';

    @Input() calendarDisplay: boolean = false;

    @Input() dateOrTime: boolean = false;

    getFormattedDate(): string {
        this.displayDate = Converter.getDateObj(this.displayDate);

        if (this.calendarDisplay) {
            return this.displayDate != null ? moment(this.displayDate).calendar(null, {sameElse : 'lll'}) : '';
        } else if (this.dateOrTime) {
            if (this.displayDate == null) {
                return '';
            }

            if (moment(this.displayDate).isSame(moment(), 'day')) {
                return moment(this.displayDate).format('LT');
            } else {
                return moment(this.displayDate).format('l');
            }
        } else {
            return this.displayDate != null ? moment(this.displayDate).format(this.pattern) : '';
        }

    }

}
