import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {TranslateModule} from '@ngx-translate/core';

import {IonicModule} from '@ionic/angular';

import {CandidateDetailsPage} from './candidate-details.page';

import {ToolbarUserTitleModule} from '../../../components/core/toolbar-user-title/toolbar-user-title.module';
import {PublicUserProfileModule} from '../../../components/user/public-user-profile/public-user-profile.module';
import {BigButtonModule} from '../../../components/core/big-button/big-button.module';

const routes: Routes = [
    {
        path: '',
        component: CandidateDetailsPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        ToolbarUserTitleModule,
        PublicUserProfileModule,
        BigButtonModule
    ],
    declarations: [CandidateDetailsPage]
})
export class CandidateDetailsPageModule {
}
