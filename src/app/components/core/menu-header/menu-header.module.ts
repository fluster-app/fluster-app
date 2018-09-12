import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {MenuHeaderComponent} from './menu-header';
import {UserProfileImgModule} from '../user-profile/user-profile-img.module';

@NgModule({
    declarations: [
        MenuHeaderComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        UserProfileImgModule
    ],
    exports: [
        MenuHeaderComponent
    ]
})
export class MenuHeaderModule {
}
