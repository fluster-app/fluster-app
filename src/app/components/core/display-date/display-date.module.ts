import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {DisplayDateComponent} from './display-date';

@NgModule({
    declarations: [
        DisplayDateComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        DisplayDateComponent
    ]
})
export class DisplayDateModule {
}
