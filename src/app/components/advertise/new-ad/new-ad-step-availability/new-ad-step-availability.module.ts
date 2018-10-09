import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {TargetedUsersModule} from '../../targeted-users/targeted-users.module';
import {NewAdStepAvailabilityComponent} from './new-ad-step-availability';
import {DisplayDateModule} from '../../../core/display-date/display-date.module';
import {DatePickerModalModule} from '../../../../modals/core/date-picker/date-picker.module';

@NgModule({
    declarations: [
        NewAdStepAvailabilityComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule.forChild(),
        TargetedUsersModule,
        DisplayDateModule,
        DatePickerModalModule
    ],
    exports: [
        NewAdStepAvailabilityComponent
    ]
})
export class NewAdStepAvailabilityModule {
}
