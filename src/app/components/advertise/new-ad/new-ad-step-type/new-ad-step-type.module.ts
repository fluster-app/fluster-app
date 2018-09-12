import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {NewAdStepTypeComponent} from './new-ad-step-type';

import {BigButtonModule} from '../../../core/big-button/big-button.module';

@NgModule({
    declarations: [
        NewAdStepTypeComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        BigButtonModule
    ],
    exports: [
        NewAdStepTypeComponent
    ]
})
export class NewAdStepTypeModule {
}
