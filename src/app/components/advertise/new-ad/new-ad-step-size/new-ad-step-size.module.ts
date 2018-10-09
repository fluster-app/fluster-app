import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {TargetedUsersModule} from '../../targeted-users/targeted-users.module';
import {NewAdStepSizeComponent} from './new-ad-step-size';
import {DisplayFloorModule} from '../../../core/display-floor/display-floor.module';
import {LabelSingularPluralModule} from '../../../core/label-singular-plural/label-singular-plural.module';
import {SelectFloorModalModule} from '../../../../modals/advertise/select-floor/select-floor.module';

@NgModule({
    declarations: [
        NewAdStepSizeComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forChild(),
        TargetedUsersModule,
        DisplayFloorModule,
        LabelSingularPluralModule,
        SelectFloorModalModule
    ],
    exports: [
        NewAdStepSizeComponent
    ]
})
export class NewAdStepSizeModule {
}
