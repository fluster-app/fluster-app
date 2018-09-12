import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {AdsNextAppointmentsPage} from './ads-next-appointments.page';

import {TranslateModule} from '@ngx-translate/core';

import {NavbarNotificationModule} from '../../../../components/core/notification/navbar-notification/navbar-notification.module';
import {ContentAdvertiseNotificationModule} from '../../../../components/core/notification/content-notification/content-advertise-notification.module';
import {NoAdsUsersModule} from '../../../../components/advertise/no-ads-users/no-ads-users.module';
import {DisplayDateModule} from '../../../../components/core/display-date/display-date.module';
import {ListChatNotificationsModule} from '../../../../components/core/list-chat-notifications/list-chat-notifications.module';
import {NoAdsModule} from '../../../../components/advertise/no-ads/no-ads.module';
import {UserProfileImgListModule} from '../../../../components/core/user-profile/user-profile-img-list.module';

const routes: Routes = [
    {
        path: '',
        component: AdsNextAppointmentsPage
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
        ContentAdvertiseNotificationModule,
        NoAdsUsersModule,
        DisplayDateModule,
        ListChatNotificationsModule,
        NoAdsModule,
        UserProfileImgListModule
    ],
    declarations: [AdsNextAppointmentsPage]
})
export class AdsNextAppointmentsPageModule {
}
