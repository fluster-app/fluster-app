import {Component, Input} from '@angular/core';

import {TranslateService} from '@ngx-translate/core';

// Pages
import {AbstractPage} from '../../../pages/abstract-page';

// Model
import {Item} from '../../../services/model/item/item';

// Utils
import {Comparator, Converter} from '../../../services/core/utils/utils';
import {ItemsComparator} from '../../../services/core/utils/items-utils';

@Component({
    templateUrl: 'item-summary.html',
    styleUrls: ['./item-summary.scss'],
    selector: 'app-item-summary'
})
export class ItemSummaryComponent extends AbstractPage {

    @Input() item: Item;

    @Input() displayType: boolean = true;

    @Input() displayEmptyLine: boolean = true;

    @Input() bookmarkDisplay: boolean = false;

    constructor(private translateService: TranslateService) {
        super();
    }

    isItemShare(item: Item): boolean {
        return ItemsComparator.isItemShare(item);
    }

    isItemFlat(item: Item): boolean {
        return ItemsComparator.isItemFlat(item);
    }

    isAvailableNow(item: Item): boolean {
        const begin: Date = Converter.getDateObj(item.attributes.availability.begin);
        return begin != null && begin.getTime() <= new Date().getTime();
    }

    hasEndAvailability(item: Item): boolean {
        const end: Date = Converter.getDateObj(item.attributes.availability.end);
        return end != null;
    }

    hasCity(item: Item): boolean {
        return !Comparator.isEmpty(item) && !Comparator.isStringEmpty(item.address.city);
    }

    displayShareType() {
        return !Comparator.equals(this.translateService.currentLang, 'de') && !Comparator.equals(this.translateService.currentLang, 'fr');
    }
}
