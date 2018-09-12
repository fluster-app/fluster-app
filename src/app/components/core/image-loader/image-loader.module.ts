import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ImageLoaderComponent} from './image-loader';

@NgModule({
    declarations: [
        ImageLoaderComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        ImageLoaderComponent
    ]
})
export class ImageLoaderModule {
}
