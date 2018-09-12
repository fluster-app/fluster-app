import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {PickAdsAppointmentsComponent} from './pick-ads-appointments';
import {DayAbbreviationModule} from '../../core/day-abbreviation/day-abbreviation.module';
import {DisplayDateModule} from '../../core/display-date/display-date.module';
import {DisplayAppointmentsCountModule} from '../display-appointments-count/display-appointments-count.module';

@NgModule({
    declarations: [
        PickAdsAppointmentsComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        DayAbbreviationModule,
        DisplayDateModule,
        DisplayAppointmentsCountModule
    ],
    exports: [
        PickAdsAppointmentsComponent
    ]
})
export class PickAdsAppointmentsModule {
}
