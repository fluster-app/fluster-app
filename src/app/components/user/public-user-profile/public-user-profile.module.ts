import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {PublicUserProfileComponent} from './public-user-profile';
import {PublicUserProfileSummaryModule} from './public-user-profile-summary.module';
import {DisplaySpotifyModule} from '../../core/spotify/display-spotify/display-spotify.module';
import {DisplayLifestyleModule} from '../../core/display-lifestyle/display-lifestyle.module';
import {DisplayHobbiesModule} from '../../core/display-hobbies/display-hobbies.module';
import {PublicUserSkeletonProfileModule} from './public-user-skeleton-profile.module';

@NgModule({
    declarations: [
        PublicUserProfileComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        PublicUserProfileSummaryModule,
        DisplaySpotifyModule,
        DisplayLifestyleModule,
        DisplayHobbiesModule,
        PublicUserSkeletonProfileModule
    ],
    exports: [
        PublicUserProfileComponent
    ]
})
export class PublicUserProfileModule {
}
