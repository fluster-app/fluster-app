import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {PublicUserProfileSummaryInfoComponent} from './public-user-profile-summary-info';

@NgModule({
    declarations: [
        PublicUserProfileSummaryInfoComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        PublicUserProfileSummaryInfoComponent
    ]
})
export class PublicUserProfileSummaryInfoModule {
}
