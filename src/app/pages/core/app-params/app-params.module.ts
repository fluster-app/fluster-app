import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {AppParamsPage} from './app-params.page';
import {WebSocialShareModule} from '../../../components/core/web-social-share/web-social-share.module';

const routes: Routes = [
    {
        path: '',
        component: AppParamsPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        WebSocialShareModule
    ],
    declarations: [AppParamsPage]
})
export class AppParamsPageModule {
}
