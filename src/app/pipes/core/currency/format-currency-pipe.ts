import {Pipe, PipeTransform} from '@angular/core';
import {CurrencyService} from '../../../services/core/currency/currency-service';

@Pipe({name: 'formatCurrency'})
export class FormatCurrencyPipe implements PipeTransform {

    constructor(private currencyService: CurrencyService) {

    }

    transform(input: any): any {

        return this.currencyService.transformToLocaleString(input);
    }
}
