import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {AdvertiserInfoSlideComponent} from './advertiser-info-slide';
import {DisplayHobbiesModule} from '../../core/display-hobbies/display-hobbies.module';
import {UserProfileImgModule} from '../../core/user-profile/user-profile-img.module';
import {PublicUserProfileSummaryInfoModule} from '../../user/public-user-profile/public-user-profile-summary-info.module';

@NgModule({
    declarations: [
        AdvertiserInfoSlideComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        UserProfileImgModule,
        DisplayHobbiesModule,
        PublicUserProfileSummaryInfoModule
    ],
    exports: [
        AdvertiserInfoSlideComponent
    ]
})
export class AdvertiserInfoSlideModule {
}
