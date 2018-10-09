import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {TargetedUsersModule} from '../../targeted-users/targeted-users.module';
import {NewAdStepLocationComponent} from './new-ad-step-location';
import {SearchLocationModalModule} from '../../../../modals/core/search-location/search-location.module';

@NgModule({
    declarations: [
        NewAdStepLocationComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        TargetedUsersModule,
        SearchLocationModalModule
    ],
    exports: [
        NewAdStepLocationComponent
    ]
})
export class NewAdStepLocationModule {
}
