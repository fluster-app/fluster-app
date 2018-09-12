import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {DisplayCurrencyComponent} from './display-currency';

@NgModule({
    declarations: [
        DisplayCurrencyComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        DisplayCurrencyComponent
    ]
})
export class DisplayCurrencyModule {
}
