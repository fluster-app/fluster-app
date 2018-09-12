import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {NewAdStepPriceTotalComponent} from './new-ad-step-price-total';
import {FormatCurrencyPipeModule} from '../../../../pipes/core/currency/format-currency-pipe.module';

@NgModule({
    declarations: [
        NewAdStepPriceTotalComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        FormatCurrencyPipeModule
    ],
    exports: [
        NewAdStepPriceTotalComponent
    ]
})
export class NewAdStepPriceTotalModule {
}
