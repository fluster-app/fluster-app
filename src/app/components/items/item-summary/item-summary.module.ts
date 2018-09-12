import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ItemSummaryComponent} from './item-summary';
import {LabelSingularPluralModule} from '../../core/label-singular-plural/label-singular-plural.module';
import {FormatCurrencyPipeModule} from '../../../pipes/core/currency/format-currency-pipe.module';
import {DisplayDateModule} from '../../core/display-date/display-date.module';

@NgModule({
    declarations: [
        ItemSummaryComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        LabelSingularPluralModule,
        FormatCurrencyPipeModule,
        DisplayDateModule
    ],
    exports: [
        ItemSummaryComponent
    ]
})
export class ItemSummaryModule {
}
