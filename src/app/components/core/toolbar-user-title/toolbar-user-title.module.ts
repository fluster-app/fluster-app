import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ToolbarUserTitleComponent} from './toolbar-user-title';
import {UserProfileImgModule} from '../user-profile/user-profile-img.module';

@NgModule({
    declarations: [
        ToolbarUserTitleComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        UserProfileImgModule
    ],
    exports: [
        ToolbarUserTitleComponent
    ]
})
export class ToolbarUserTitleModule {
}
