import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {DisplayTimeComponent} from './display-time';

@NgModule({
    declarations: [
        DisplayTimeComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        DisplayTimeComponent
    ]
})
export class DisplayTimeModule {
}
