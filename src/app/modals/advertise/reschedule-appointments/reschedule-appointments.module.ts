import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {RescheduleAppointmentsModal} from './reschedule-appointments';

import {PickRescheduleAppointmentsModule} from '../../../components/advertise/pick-reschedule-appointments/pick-reschedule-appointments.module';

@NgModule({
    declarations: [
        RescheduleAppointmentsModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        PickRescheduleAppointmentsModule
    ],
    entryComponents: [
        RescheduleAppointmentsModal
    ]
})
export class RescheduleAppointmentsModalModule {
}
