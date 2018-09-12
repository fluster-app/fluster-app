import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {ProductPickerPopover} from './product-picker';

@NgModule({
    declarations: [
        ProductPickerPopover
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    entryComponents: [
        ProductPickerPopover
    ]
})
export class ProductPickerPopoverModule {
}

