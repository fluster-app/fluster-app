import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {NewAdStepAttributesComponent} from './new-ad-step-attributes';
import {TargetedUsersModule} from '../../targeted-users/targeted-users.module';

@NgModule({
    declarations: [
        NewAdStepAttributesComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule.forChild(),
        TargetedUsersModule
    ],
    exports: [
        NewAdStepAttributesComponent
    ]
})
export class NewAdStepAttributesModule {
}
