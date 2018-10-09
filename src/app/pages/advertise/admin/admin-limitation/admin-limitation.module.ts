import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {AdminLimitationPage} from './admin-limitation.page';

import {TargetedUsersModule} from '../../../../components/advertise/targeted-users/targeted-users.module';

const routes: Routes = [
    {
        path: '',
        component: AdminLimitationPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        TargetedUsersModule
    ],
    declarations: [AdminLimitationPage]
})
export class AdminLimitationPageModule {
}
