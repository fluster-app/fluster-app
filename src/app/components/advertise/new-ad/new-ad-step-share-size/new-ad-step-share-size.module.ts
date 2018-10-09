import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {TargetedUsersModule} from '../../targeted-users/targeted-users.module';
import {NewAdStepShareSizeComponent} from './new-ad-step-share-size';
import {LabelSingularPluralModule} from '../../../core/label-singular-plural/label-singular-plural.module';
import {SelectAttributesModalModule} from '../../../../modals/advertise/select-attributes/select-attributes.module';

@NgModule({
    declarations: [
        NewAdStepShareSizeComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forChild(),
        TargetedUsersModule,
        LabelSingularPluralModule,
        SelectAttributesModalModule
    ],
    exports: [
        NewAdStepShareSizeComponent
    ]
})
export class NewAdStepShareSizeModule {
}
