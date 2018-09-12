import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ItemInterestsComponent} from './item-interests';
import {ItemInterestModule} from './item-interest.module';

@NgModule({
    declarations: [
        ItemInterestsComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        ItemInterestModule
    ],
    exports: [
        ItemInterestsComponent
    ]
})
export class ItemInterestsModule {
}
