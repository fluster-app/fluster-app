import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {DayAbbreviationComponent} from './day-abbreviation';

@NgModule({
    declarations: [
        DayAbbreviationComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        DayAbbreviationComponent
    ]
})
export class DayAbbreviationModule {
}
