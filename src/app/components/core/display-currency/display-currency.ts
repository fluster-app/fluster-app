import {Component, Input} from '@angular/core';

import {CurrencyService} from '../../../services/core/currency/currency-service';
import {Comparator} from '../../../services/core/utils/utils';

@Component({
    templateUrl: 'display-currency.html',
    selector: 'app-display-currency'
})
export class DisplayCurrencyComponent {

    @Input() value: number;

    constructor(private currencyService: CurrencyService) {

    }

    getCurrency(): string {
        if (!Comparator.isEmpty(this.currencyService.getCurrencyFormat()) &&
            !Comparator.isEmpty(this.currencyService.getCurrencyFormat().symbol)) {
            return this.currencyService.getCurrencyFormat().symbol.grapheme;
        } else if (!Comparator.isStringEmpty(this.currencyService.getCurrency())) {
            return this.currencyService.getCurrency();
        } else {
            return '';
        }
    }
}
