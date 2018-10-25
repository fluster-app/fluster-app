import {Component, Input} from '@angular/core';

// Model
import {Item} from '../../../../services/model/item/item';

// Utils
import {Resources} from '../../../../services/core/utils/resources';

@Component({
    templateUrl: 'item-details-header.html',
    styleUrls: ['./item-details-header.scss'],
    selector: 'app-item-details-header'
})
export class ItemDetailsHeaderComponent {

    RESOURCES: any = Resources.Constants;

    @Input() item: Item;

    @Input() displayItemExpire: boolean = false;

    @Input() displayAdvertiserSlide: boolean = false;

    @Input() adDisplay: boolean = false;

    @Input() displayFullAddress: boolean = false;

    constructor() {

    }

}
