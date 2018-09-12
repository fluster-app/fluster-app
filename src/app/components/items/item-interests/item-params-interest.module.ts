import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ItemParamsInterestComponent} from './item-params-interest';
import {ProductPickerPopoverModule} from '../../../modals/core/product-picker/product-picker.module';
import {BigButtonModule} from '../../core/big-button/big-button.module';
import {SelectInterestModalModule} from '../../../modals/browse/select-interest/select-interest.module';

@NgModule({
    declarations: [
        ItemParamsInterestComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        ProductPickerPopoverModule,
        BigButtonModule,
        SelectInterestModalModule
    ],
    exports: [
        ItemParamsInterestComponent
    ]
})
export class ItemParamsInterestModule {
}
