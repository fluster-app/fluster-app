import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {UserProfileImgComponent} from './user-profile-img';

@NgModule({
    declarations: [
        UserProfileImgComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        UserProfileImgComponent
    ]
})
export class UserProfileImgModule {
}
