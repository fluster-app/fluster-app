import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {PickApplicantAppointmentsComponent} from './pick-applicant-appointments';
import {DayAbbreviationModule} from '../../core/day-abbreviation/day-abbreviation.module';
import {DisplayDateModule} from '../../core/display-date/display-date.module';

@NgModule({
    declarations: [
        PickApplicantAppointmentsComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        DayAbbreviationModule,
        DisplayDateModule
    ],
    exports: [
        PickApplicantAppointmentsComponent
    ]
})
export class PickApplicantAppointmentsModule {
}
