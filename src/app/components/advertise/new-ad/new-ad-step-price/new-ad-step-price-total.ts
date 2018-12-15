import {Component, Input, OnChanges, SimpleChange} from '@angular/core';
import {IonSlides} from '@ionic/angular';

// Model
import {Item} from '../../../../services/model/item/item';

// Pages
import {AbstractNewAdComponent} from '../abstract-new-ad';

// Utils
import {Comparator, Converter} from '../../../../services/core/utils/utils';

// Service
import {NewItemService} from '../../../../services/advertise/new-item-service';

@Component({
    templateUrl: 'new-ad-step-price-total.html',
    styleUrls: ['./new-ad-step-price-total.scss'],
    selector: 'app-new-ad-step-price-total'
})
export class NewAdStepPriceTotalComponent extends AbstractNewAdComponent implements OnChanges {

    newItem: Item;

    @Input() slider: IonSlides;

    @Input() price: string;
    @Input() charges: string;

    total: number = 0;

    constructor(protected newItemService: NewItemService) {
        super(newItemService);

        this.newItem = this.newItemService.getNewItem();
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (!Comparator.isStringEmpty(this.price)) {
            this.total = !Comparator.isStringEmpty(this.charges) ?
                (Converter.roundCurrency(this.price) + Converter.roundCurrency(this.charges)) : Converter.roundCurrency(this.price);
        }
    }
}
