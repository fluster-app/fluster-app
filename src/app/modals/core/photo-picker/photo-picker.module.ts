import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {PhotoPickerModal} from './photo-picker';

import {BigButtonModule} from '../../../components/core/big-button/big-button.module';

@NgModule({
    declarations: [
        PhotoPickerModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        BigButtonModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [
        PhotoPickerModal
    ]
})
export class PhotoPickerModalModule {
}

