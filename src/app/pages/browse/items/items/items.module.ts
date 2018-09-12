import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {IonicSwingModule} from 'ionic-swing';

import {ItemsPage} from './items.page';

import {UserProfileImgModule} from '../../../../components/core/user-profile/user-profile-img.module';
import {NavbarNotificationModule} from '../../../../components/core/notification/navbar-notification/navbar-notification.module';
import {ItemInterestsModule} from '../../../../components/items/item-interests/item-interests.module';
import {NoItemsModule} from '../../../../components/items/no-items/no-items.module';
import {ContentBrowseNotificationModule} from '../../../../components/core/notification/content-notification/content-browse-notification.module';
import {ItemSummaryModule} from '../../../../components/items/item-summary/item-summary.module';
import {ItemSlidesModule} from '../../../../components/items/item-slides/item-slides.module';
import {ItemAppointmentsModalModule} from '../../../../modals/browse/item-appointments/item-appointments.module';
import {ItemParamsInterestModule} from '../../../../components/items/item-interests/item-params-interest.module';
import {ProductPickerPopoverModule} from '../../../../modals/core/product-picker/product-picker.module';

const routes: Routes = [
    {
        path: '',
        component: ItemsPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),

        TranslateModule.forChild(),
        IonicSwingModule,

        UserProfileImgModule,
        NavbarNotificationModule,
        NoItemsModule,
        ItemInterestsModule,
        ContentBrowseNotificationModule,
        ItemSummaryModule,
        ItemSlidesModule,
        ItemAppointmentsModalModule,
        ProductPickerPopoverModule
    ],
    declarations: [ItemsPage]
})
export class ItemsPageModule {
}
