import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {PublicUserSkeletonProfileSummaryComponent} from './public-user-skeleton-profile-summary';
import {UserProfileImgModule} from '../../core/user-profile/user-profile-img.module';

@NgModule({
    declarations: [
        PublicUserSkeletonProfileSummaryComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        UserProfileImgModule
    ],
    exports: [
        PublicUserSkeletonProfileSummaryComponent
    ]
})
export class PublicUserSkeletonProfileSummaryModule {
}
