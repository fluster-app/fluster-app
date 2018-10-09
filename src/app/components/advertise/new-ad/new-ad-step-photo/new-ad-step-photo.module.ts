import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {TargetedUsersModule} from '../../targeted-users/targeted-users.module';
import {NewAdStepPhotoComponent} from './new-ad-step-photo';
import {PhotoPickerModalModule} from '../../../../modals/core/photo-picker/photo-picker.module';

@NgModule({
    declarations: [
        NewAdStepPhotoComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        TargetedUsersModule,
        PhotoPickerModalModule
    ],
    exports: [
        NewAdStepPhotoComponent
    ]
})
export class NewAdStepPhotoModule {
}
