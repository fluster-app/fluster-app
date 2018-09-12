import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {TranslateModule} from '@ngx-translate/core';

import {IonicModule} from '@ionic/angular';

import {CandidatesPage} from './candidates.page';

import {NavbarNotificationModule} from '../../../../components/core/notification/navbar-notification/navbar-notification.module';
import {UserProfileImgListModule} from '../../../../components/core/user-profile/user-profile-img-list.module';
import {NoAdsModule} from '../../../../components/advertise/no-ads/no-ads.module';
import {NoAdsUsersModule} from '../../../../components/advertise/no-ads-users/no-ads-users.module';

const routes: Routes = [
    {
        path: '',
        component: CandidatesPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        NavbarNotificationModule,
        UserProfileImgListModule,
        NoAdsModule,
        NoAdsUsersModule
    ],
    declarations: [CandidatesPage]
})
export class CandidatesPageModule {
}
