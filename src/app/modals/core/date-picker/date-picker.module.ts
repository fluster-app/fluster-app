import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {DatePickerModal} from './date-picker';

import {DisplayDateModule} from '../../../components/core/display-date/display-date.module';

@NgModule({
    declarations: [
        DatePickerModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        DisplayDateModule
    ], entryComponents: [
        DatePickerModal
    ]
})
export class DatePickerModalModule {
}

