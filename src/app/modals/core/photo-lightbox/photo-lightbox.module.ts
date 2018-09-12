import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {PhotoLightboxModal} from './photo-lightbox';
import {ImageLoaderModule} from '../../../components/core/image-loader/image-loader.module';

@NgModule({
    declarations: [
        PhotoLightboxModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        ImageLoaderModule
    ],
    entryComponents: [
        PhotoLightboxModal
    ]
})
export class PhotoLightboxModalModule {
}

