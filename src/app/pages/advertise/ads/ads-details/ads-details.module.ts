import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {TranslateModule} from '@ngx-translate/core';

import {IonicModule} from '@ionic/angular';

import {AdsDetailsPage} from './ads-details.page';

import {NavbarNotificationModule} from '../../../../components/core/notification/navbar-notification/navbar-notification.module';
import {ContentAdvertiseNotificationModule} from '../../../../components/core/notification/content-notification/content-advertise-notification.module';
import {ItemDetailsHeaderModule} from '../../../../components/items/item-details/item-details-header/item-details-header.module';
import {ItemDetailsContentModule} from '../../../../components/items/item-details/item-details-content/item-details-content.module';
import {NoAdsModule} from '../../../../components/advertise/no-ads/no-ads.module';
import {WebSocialShareModule} from '../../../../components/core/web-social-share/web-social-share.module';
import {NavbarOnScrollDirectiveModule} from '../../../../directives/core/navbar/navbar-on-scroll-directive.module';

const routes: Routes = [
    {
        path: '',
        component: AdsDetailsPage
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
        ItemDetailsHeaderModule,
        ItemDetailsContentModule,
        NoAdsModule,
        WebSocialShareModule,
        NavbarOnScrollDirectiveModule
    ],
    declarations: [AdsDetailsPage]
})
export class AdsDetailsPageModule {
}
