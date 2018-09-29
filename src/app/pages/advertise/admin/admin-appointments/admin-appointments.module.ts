import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {TranslateModule} from '@ngx-translate/core';

import {IonicModule} from '@ionic/angular';

import {AdminAppointmentsPage} from './admin-appointments.page';

import {PickAdsAppointmentsModule} from '../../../../components/advertise/pick-ads-appointments/pick-ads-appointments.module';

const routes: Routes = [
    {
        path: '',
        component: AdminAppointmentsPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        PickAdsAppointmentsModule
    ],
    declarations: [AdminAppointmentsPage]
})
export class AdminAppointmentsPageModule {
}
