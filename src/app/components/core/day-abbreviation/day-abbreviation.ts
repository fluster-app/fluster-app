import {Component, Input} from '@angular/core';

// Resources and utils
import {Converter} from '../../../services/core/utils/utils';

@Component({
    templateUrl: 'day-abbreviation.html',
    selector: 'app-day-abbreviation'
})
export class DayAbbreviationComponent {

    @Input() dayOfTheWeek: Date;
    @Input() today: boolean;

    getDisplayDayOfTheWeek(): number {
        this.dayOfTheWeek = Converter.getDateObj(this.dayOfTheWeek);

        return this.dayOfTheWeek != null ? this.dayOfTheWeek.getDay() : null;
    }

}
