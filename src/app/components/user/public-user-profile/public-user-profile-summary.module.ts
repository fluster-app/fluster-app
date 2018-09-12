import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {PublicUserProfileSummaryComponent} from './public-user-profile-summary';
import {UserProfileImgModule} from '../../core/user-profile/user-profile-img.module';
import {PublicUserProfileSummaryInfoModule} from './public-user-profile-summary-info.module';
import {PublicUserSkeletonProfileSummaryModule} from './public-user-skeleton-profile-summary.module';

@NgModule({
    declarations: [
        PublicUserProfileSummaryComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        UserProfileImgModule,
        PublicUserProfileSummaryInfoModule,
        PublicUserSkeletonProfileSummaryModule
    ],
    exports: [
        PublicUserProfileSummaryComponent
    ]
})
export class PublicUserProfileSummaryModule {
}
