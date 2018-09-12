import {Component, Input} from '@angular/core';

// Pages
import {AbstractPage} from '../../../pages/abstract-page';

// Model
import {User} from '../../../services/model/user/user';
import {Comparator} from '../../../services/core/utils/utils';

@Component({
    templateUrl: 'advertiser-info-slide.html',
    styleUrls: ['./advertiser-info-slide.scss'],
    selector: 'app-advertiser-info-slide'
})
export class AdvertiserInfoSlideComponent extends AbstractPage {

    @Input() user: User;

    @Input() starred: boolean = false;

    constructor() {
        super();
    }

    hasHobbies(): boolean {
        return !Comparator.isEmpty(this.user.description) && !Comparator.isEmpty(this.user.description.hobbies) && (
            Comparator.hasElements(this.user.description.hobbies.sports) ||
            Comparator.hasElements(this.user.description.hobbies.arts) ||
            Comparator.hasElements(this.user.description.hobbies.food) ||
            Comparator.hasElements(this.user.description.hobbies.places)
        );
    }
}
