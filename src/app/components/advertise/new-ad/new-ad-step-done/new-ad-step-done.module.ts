import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {NewAdStepDoneComponent} from './new-ad-step-done';
import {WebSocialShareModule} from '../../../core/web-social-share/web-social-share.module';
import {BigButtonModule} from '../../../core/big-button/big-button.module';

@NgModule({
    declarations: [
        NewAdStepDoneComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        WebSocialShareModule,
        BigButtonModule
    ],
    exports: [
        NewAdStepDoneComponent
    ]
})
export class NewAdStepDoneModule {
}
