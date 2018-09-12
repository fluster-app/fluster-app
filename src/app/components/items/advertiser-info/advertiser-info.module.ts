import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {AdvertiserInfoComponent} from './advertiser-info';
import {UserProfileImgModule} from '../../core/user-profile/user-profile-img.module';

@NgModule({
    declarations: [
        AdvertiserInfoComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        UserProfileImgModule
    ],
    exports: [
        AdvertiserInfoComponent
    ]
})
export class AdvertiserInfoModule {
}
