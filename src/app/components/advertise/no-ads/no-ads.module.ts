import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {NoAdsComponent} from './no-ads';

import {BigButtonModule} from '../../core/big-button/big-button.module';

@NgModule({
    declarations: [
        NoAdsComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        BigButtonModule
    ],
    exports: [
        NoAdsComponent
    ]
})
export class NoAdsModule {
}
