import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {PickItemAppointmentsComponent} from './pick-item-appointments';
import {ItemAppointmentsDatePickerModule} from '../item-appointments-date-picker/item-appointments-date-picker.module';
import {ProductPickerPopoverModule} from '../../../modals/core/product-picker/product-picker.module';

@NgModule({
    declarations: [
        PickItemAppointmentsComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        ItemAppointmentsDatePickerModule,
        ProductPickerPopoverModule
    ],
    exports: [
        PickItemAppointmentsComponent
    ]
})
export class PickItemAppointmentsModule {
}
