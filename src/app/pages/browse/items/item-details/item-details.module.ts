import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {ItemDetailsPage} from './item-details.page';

import {TranslateModule} from '@ngx-translate/core';

import {NavbarNotificationModule} from '../../../../components/core/notification/navbar-notification/navbar-notification.module';
import {ToolbarUserTitleModule} from '../../../../components/core/toolbar-user-title/toolbar-user-title.module';
import {ContentBrowseNotificationModule} from '../../../../components/core/notification/content-notification/content-browse-notification.module';
import {ItemDetailsHeaderModule} from '../../../../components/items/item-details/item-details-header/item-details-header.module';
import {ItemDetailsContentModule} from '../../../../components/items/item-details/item-details-content/item-details-content.module';
import {ItemAppointmentsModalModule} from '../../../../modals/browse/item-appointments/item-appointments.module';
import {ProductPickerPopoverModule} from '../../../../modals/core/product-picker/product-picker.module';
import {WebSocialShareModule} from '../../../../components/core/web-social-share/web-social-share.module';
import {NavbarOnScrollDirectiveModule} from '../../../../directives/core/navbar/navbar-on-scroll-directive.module';

const routes: Routes = [
    {
        path: '',
        component: ItemDetailsPage
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
        ToolbarUserTitleModule,
        ContentBrowseNotificationModule,
        ItemDetailsHeaderModule,
        ItemDetailsContentModule,
        ItemAppointmentsModalModule,
        ProductPickerPopoverModule,
        WebSocialShareModule,
        NavbarOnScrollDirectiveModule
    ],
    declarations: [ItemDetailsPage]
})
export class ItemDetailsPageModule {
}
