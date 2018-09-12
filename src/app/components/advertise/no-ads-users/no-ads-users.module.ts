import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {NoAdsUsersComponent} from './no-ads-users';
import {UserProfileImgModule} from '../../core/user-profile/user-profile-img.module';

@NgModule({
    declarations: [
        NoAdsUsersComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        UserProfileImgModule
    ],
    exports: [
        NoAdsUsersComponent
    ]
})
export class NoAdsUsersModule {
}
