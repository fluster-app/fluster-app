import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ItemDetailsHeaderComponent} from './item-details-header';
import {ImageLoaderModule} from '../../../core/image-loader/image-loader.module';
import {ItemSummaryModule} from '../../item-summary/item-summary.module';
import {ItemSlidesModule} from '../../item-slides/item-slides.module';

@NgModule({
    declarations: [
        ItemDetailsHeaderComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        ImageLoaderModule,
        ItemSummaryModule,
        ItemSlidesModule
    ],
    exports: [
        ItemDetailsHeaderComponent
    ]
})
export class ItemDetailsHeaderModule {
}
