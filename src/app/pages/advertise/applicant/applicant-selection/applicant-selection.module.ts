import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ApplicantSelectionPage} from './applicant-selection.page';

import {ToolbarUserTitleModule} from '../../../../components/core/toolbar-user-title/toolbar-user-title.module';
import {PublicUserProfileModule} from '../../../../components/user/public-user-profile/public-user-profile.module';
import {DisplayDateModule} from '../../../../components/core/display-date/display-date.module';
import {BigButtonModule} from '../../../../components/core/big-button/big-button.module';
import {ApplicantAppointmentsModalModule} from '../../../../modals/advertise/applicant-appointments/applicant-appointments.module';

const routes: Routes = [
    {
        path: '',
        component: ApplicantSelectionPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        ToolbarUserTitleModule,
        PublicUserProfileModule,
        DisplayDateModule,
        BigButtonModule,
        ApplicantAppointmentsModalModule
    ],
    declarations: [ApplicantSelectionPage]
})
export class ApplicantSelectionPageModule {
}
