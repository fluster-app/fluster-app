import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {NewAdStepAttendanceComponent} from './new-ad-step-attendance';

import {BigButtonModule} from '../../../core/big-button/big-button.module';

@NgModule({
    declarations: [
        NewAdStepAttendanceComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        BigButtonModule
    ],
    exports: [
        NewAdStepAttendanceComponent
    ]
})
export class NewAdStepAttendanceModule {
}
