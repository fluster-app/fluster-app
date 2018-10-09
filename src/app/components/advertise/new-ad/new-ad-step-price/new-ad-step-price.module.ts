import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {TargetedUsersModule} from '../../targeted-users/targeted-users.module';
import {NewAdStepPriceComponent} from './new-ad-step-price';
import {DisplayCurrencyModule} from '../../../core/display-currency/display-currency.module';
import {NewAdStepPriceTotalModule} from './new-ad-step-price-total.module';

@NgModule({
    declarations: [
        NewAdStepPriceComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forChild(),
        TargetedUsersModule,
        DisplayCurrencyModule,
        NewAdStepPriceTotalModule
    ],
    exports: [
        NewAdStepPriceComponent
    ]
})
export class NewAdStepPriceModule {
}
