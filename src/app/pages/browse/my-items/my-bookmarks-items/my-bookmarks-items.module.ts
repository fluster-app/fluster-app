import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {MyBookmarksItemsPage} from './my-bookmarks-items.page';

import {TranslateModule} from '@ngx-translate/core';

import {NavbarNotificationModule} from '../../../../components/core/notification/navbar-notification/navbar-notification.module';
import {ContentBrowseNotificationModule} from '../../../../components/core/notification/content-notification/content-browse-notification.module';
import {NoItemsModule} from '../../../../components/items/no-items/no-items.module';
import {ImageLoaderModule} from '../../../../components/core/image-loader/image-loader.module';
import {ItemSummaryModule} from '../../../../components/items/item-summary/item-summary.module';
import {UserProfileImgListModule} from '../../../../components/core/user-profile/user-profile-img-list.module';
import {ItemAppointmentsModalModule} from '../../../../modals/browse/item-appointments/item-appointments.module';

const routes: Routes = [
    {
        path: '',
        component: MyBookmarksItemsPage
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
        ContentBrowseNotificationModule,
        NoItemsModule,
        ImageLoaderModule,
        ItemSummaryModule,
        UserProfileImgListModule,
        ItemAppointmentsModalModule
    ],
    declarations: [MyBookmarksItemsPage]
})
export class MyBookmarksItemsPageModule {
}
