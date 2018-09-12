import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {LabelSingularPluralComponent} from './label-singular-plural';

@NgModule({
    declarations: [
        LabelSingularPluralComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        LabelSingularPluralComponent
    ]
})
export class LabelSingularPluralModule {
}
