import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {SelectWorkSchoolModal} from './select-work-school';

@NgModule({
    declarations: [
        SelectWorkSchoolModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        FormsModule,
        ReactiveFormsModule
    ],
    entryComponents: [
        SelectWorkSchoolModal
    ]
})
export class SelectWorkSchoolModalModule {
}

