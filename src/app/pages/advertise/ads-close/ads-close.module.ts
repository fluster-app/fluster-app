import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {TranslateModule} from '@ngx-translate/core';

import {IonicModule} from '@ionic/angular';

import {AdsClosePage} from './ads-close.page';
import {UserProfileImgModule} from '../../../components/core/user-profile/user-profile-img.module';

const routes: Routes = [
    {
        path: '',
        component: AdsClosePage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        UserProfileImgModule
    ],
    declarations: [AdsClosePage]
})
export class AdsClosePageModule {
}
