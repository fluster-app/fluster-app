import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {SelectLocationComponent} from './select-location';

@NgModule({
    declarations: [
        SelectLocationComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forChild()
    ],
    exports: [
        SelectLocationComponent
    ]
})
export class SelectLocationModule {
}
