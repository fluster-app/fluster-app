import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ItemAppointmentsDatePickerComponent} from './item-appointments-date-picker';
import {DayAbbreviationModule} from '../../core/day-abbreviation/day-abbreviation.module';
import {DisplayDateModule} from '../../core/display-date/display-date.module';

@NgModule({
    declarations: [
        ItemAppointmentsDatePickerComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        DayAbbreviationModule,
        DisplayDateModule
    ],
    exports: [
        ItemAppointmentsDatePickerComponent
    ]
})
export class ItemAppointmentsDatePickerModule {
}
