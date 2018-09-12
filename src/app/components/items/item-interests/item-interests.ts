import {Component, Input} from '@angular/core';

// Page
import {AbstractPage} from '../../../pages/abstract-page';

// Model
import {ItemUser} from '../../../services/model/item/item-user';

// Resources and utils
import {Comparator} from '../../../services/core/utils/utils';

@Component({
    templateUrl: 'item-interests.html',
    styleUrls: ['./item-interests.scss'],
    selector: 'app-item-interests'
})
export class ItemInterestsComponent extends AbstractPage {

    @Input() itemUser: ItemUser;

    constructor() {
        super();
    }

    hasItemUser(): boolean {
        return !Comparator.isEmpty(this.itemUser);
    }

    hasItemInterest(index: number): boolean {
        return this.hasItemUser() && Comparator.hasElements(this.itemUser.interests) && this.itemUser.interests.length >= index + 1;
    }


}
