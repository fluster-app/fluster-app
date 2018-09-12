import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ApplicantsPage} from './applicants.page';

import {ContentAdvertiseNotificationModule} from '../../../../components/core/notification/content-notification/content-advertise-notification.module';
import {NoAdsUsersModule} from '../../../../components/advertise/no-ads-users/no-ads-users.module';
import {UserProfileImgListModule} from '../../../../components/core/user-profile/user-profile-img-list.module';
import {DisplayDateModule} from '../../../../components/core/display-date/display-date.module';
import {ListChatNotificationsModule} from '../../../../components/core/list-chat-notifications/list-chat-notifications.module';
import {ApplicantsSortPipeModule} from '../../../../pipes/advertise/applicants/applicants-sort-pipe.module';
import {NoAdsModule} from '../../../../components/advertise/no-ads/no-ads.module';

const routes: Routes = [
    {
        path: '',
        component: ApplicantsPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        ContentAdvertiseNotificationModule,
        NoAdsUsersModule,
        UserProfileImgListModule,
        DisplayDateModule,
        ListChatNotificationsModule,
        ApplicantsSortPipeModule,
        NoAdsModule
    ],
    declarations: [ApplicantsPage]
})
export class ApplicantsPageModule {
}
