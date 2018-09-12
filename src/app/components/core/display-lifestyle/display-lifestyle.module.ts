import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {DisplayLifestyleComponent} from './display-lifestyle';

@NgModule({
    declarations: [
        DisplayLifestyleComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        DisplayLifestyleComponent
    ]
})
export class DisplayLifestyleModule {
}
