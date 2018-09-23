import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {ApplicantAppointmentsModal} from './applicant-appointments';

import {ToolbarUserTitleModule} from '../../../components/core/toolbar-user-title/toolbar-user-title.module';
import {PickApplicantAppointmentsModule} from '../../../components/advertise/pick-applicant-appointments/pick-applicant-appointments.module';

@NgModule({
    declarations: [
        ApplicantAppointmentsModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        ToolbarUserTitleModule,
        PickApplicantAppointmentsModule
    ],
    entryComponents: [
        ApplicantAppointmentsModal
    ]
})
export class ApplicantAppointmentsModalModule {
}

