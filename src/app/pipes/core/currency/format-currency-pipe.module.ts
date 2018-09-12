import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {FormatCurrencyPipe} from './format-currency-pipe';

@NgModule({
    declarations: [
        FormatCurrencyPipe
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        FormatCurrencyPipe
    ]
})
export class FormatCurrencyPipeModule {
}
