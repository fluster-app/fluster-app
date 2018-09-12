import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {UserProfilePage} from './user-profile.page';

import {TranslateModule} from '@ngx-translate/core';

import {PublicUserProfileSummaryModule} from '../../../components/user/public-user-profile/public-user-profile-summary.module';
import {UserProfileInputBioModule} from '../../../components/user/user-profile/user-profile-input-bio.module';
import {UserProfileInputPhoneModule} from '../../../components/user/user-profile/user-profile-input-phone.module';
import {ConnectSpotifyModule} from '../../../components/core/spotify/connect-spotify/connect-spotify.module';
import {DisplaySpotifyModule} from '../../../components/core/spotify/display-spotify/display-spotify.module';
import {ListLifestyleHobbiesModule} from '../../../components/core/list-lifestyle-hobbies/list-lifestyle.module-hobbies';
import {SelectLanguagesModalModule} from '../../../modals/core/select-languages/select-languages.module';
import {SelectWorkSchoolModalModule} from '../../../modals/core/select-work-school/select-work-school.module';

const routes: Routes = [
    {
        path: '',
        component: UserProfilePage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        PublicUserProfileSummaryModule,
        UserProfileInputBioModule,
        UserProfileInputPhoneModule,
        ConnectSpotifyModule,
        DisplaySpotifyModule,
        ListLifestyleHobbiesModule,
        SelectLanguagesModalModule,
        SelectWorkSchoolModalModule
    ],
    declarations: [UserProfilePage]
})
export class UserProfilePageModule {
}
