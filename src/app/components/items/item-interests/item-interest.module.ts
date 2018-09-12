import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ItemInterestComponent} from './item-interest';
import {DisplayTimeModule} from '../../core/display-time/display-time.module';

@NgModule({
    declarations: [
        ItemInterestComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        DisplayTimeModule
    ],
    exports: [
        ItemInterestComponent
    ]
})
export class ItemInterestModule {
}
