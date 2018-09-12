import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {UserProfileImgListComponent} from './user-profile-img-list';
import {UserProfileImgModule} from './user-profile-img.module';

@NgModule({
    declarations: [
        UserProfileImgListComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        UserProfileImgModule
    ],
    exports: [
        UserProfileImgListComponent
    ]
})
export class UserProfileImgListModule {
}
