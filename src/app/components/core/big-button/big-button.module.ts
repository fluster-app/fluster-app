import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {BigButtonComponent} from './big-button.component';

@NgModule({
    declarations: [
        BigButtonComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        BigButtonComponent
    ]
})
export class BigButtonModule {
}
