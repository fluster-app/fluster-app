import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {DisplayAppointmentsCountComponent} from './display-appointments-count';

@NgModule({
    declarations: [
        DisplayAppointmentsCountComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        DisplayAppointmentsCountComponent
    ]
})
export class DisplayAppointmentsCountModule {
}
