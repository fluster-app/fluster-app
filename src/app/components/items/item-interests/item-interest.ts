import {Component, Input} from '@angular/core';

// Page and modal
import {AbstractPage} from '../../../pages/abstract-page';

// Model
import {ItemInterest} from '../../../services/model/item/item-user';

// Resources and utils
import {Comparator} from '../../../services/core/utils/utils';

@Component({
    templateUrl: 'item-interest.html',
    styleUrls: ['./item-interest.scss'],
    selector: 'app-item-interest'
})
export class ItemInterestComponent extends AbstractPage {

    @Input() interests: ItemInterest[];

    @Input() index: number;

    constructor() {
        super();
    }

    hasItemInterest(): boolean {
        return Comparator.hasElements(this.interests) && this.index != null && this.interests.length >= this.index + 1;
    }

    isOverMaxTime(): boolean {
        return Comparator.isBiggerThanZero(this.interests[this.index].time) &&
            Comparator.isBiggerThanZero(this.interests[this.index].interest.maxTravelTime) &&
            this.interests[this.index].time > this.interests[this.index].interest.maxTravelTime;
    }

    isAlmostMaxTime(): boolean {
        return Comparator.isBiggerThanZero(this.interests[this.index].time) &&
            Comparator.isBiggerThanZero(this.interests[this.index].interest.maxTravelTime) &&
            this.interests[this.index].time <= this.interests[this.index].interest.maxTravelTime &&
            this.interests[this.index].time > (this.interests[this.index].interest.maxTravelTime * 0.85);
    }

    isUnderMaxTime(): boolean {
        return !Comparator.isBiggerThanZero(this.interests[this.index].time) ||
            !Comparator.isBiggerThanZero(this.interests[this.index].interest.maxTravelTime) ||
            (this.interests[this.index].time <= (this.interests[this.index].interest.maxTravelTime * 0.85));
    }

}
