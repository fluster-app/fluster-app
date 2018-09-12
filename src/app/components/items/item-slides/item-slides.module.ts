import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ItemSlidesComponent} from './item-slides';
import {ImageLoaderModule} from '../../core/image-loader/image-loader.module';
import {AdvertiserInfoSlideModule} from '../advertiser-info-slide/advertiser-info-slide.module';
import {AdvertiserInfoModule} from '../advertiser-info/advertiser-info.module';
import {UserInfoModule} from '../../browse/user-info/user-info.module';
import {PhotoLightboxModalModule} from '../../../modals/core/photo-lightbox/photo-lightbox.module';

@NgModule({
    declarations: [
        ItemSlidesComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        ImageLoaderModule,
        AdvertiserInfoModule,
        AdvertiserInfoSlideModule,
        UserInfoModule,
        PhotoLightboxModalModule
    ],
    exports: [
        ItemSlidesComponent
    ]
})
export class ItemSlidesModule {
}
