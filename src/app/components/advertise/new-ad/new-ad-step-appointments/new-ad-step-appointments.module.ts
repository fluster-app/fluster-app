import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {NewAdStepAppointmentsComponent} from './new-ad-step-appointments';
import {PickAdsAppointmentsModule} from '../../pick-ads-appointments/pick-ads-appointments.module';

@NgModule({
    declarations: [
        NewAdStepAppointmentsComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        PickAdsAppointmentsModule
    ],
    exports: [
        NewAdStepAppointmentsComponent
    ]
})
export class NewAdStepAppointmentsModule {
}
