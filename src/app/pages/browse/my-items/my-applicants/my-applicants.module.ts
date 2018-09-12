import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {MyApplicantsPage} from './my-applicants.page';

import {TranslateModule} from '@ngx-translate/core';

import {ContentBrowseNotificationModule} from '../../../../components/core/notification/content-notification/content-browse-notification.module';
import {NoItemsModule} from '../../../../components/items/no-items/no-items.module';
import {UserProfileImgListModule} from '../../../../components/core/user-profile/user-profile-img-list.module';
import {ListChatNotificationsModule} from '../../../../components/core/list-chat-notifications/list-chat-notifications.module';
import {MyItemsSortPipeModule} from '../../../../pipes/browse/my-items/my-items-sort-pipe.module';
import {ProductPickerPopoverModule} from '../../../../modals/core/product-picker/product-picker.module';

const routes: Routes = [
    {
        path: '',
        component: MyApplicantsPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        ContentBrowseNotificationModule,
        NoItemsModule,
        UserProfileImgListModule,
        ListChatNotificationsModule,
        MyItemsSortPipeModule,
        ProductPickerPopoverModule
    ],
    declarations: [MyApplicantsPage]
})
export class MyApplicantsPageModule {
}
