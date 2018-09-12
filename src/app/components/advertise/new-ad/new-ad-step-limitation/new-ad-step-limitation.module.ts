import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {NewAdStepLimitationComponent} from './new-ad-step-limitation';
import {TargetedUsersModule} from '../targeted-users/targeted-users.module';

@NgModule({
    declarations: [
        NewAdStepLimitationComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule.forChild(),
        TargetedUsersModule
    ],
    exports: [
        NewAdStepLimitationComponent
    ]
})
export class NewAdStepLimitationModule {
}
