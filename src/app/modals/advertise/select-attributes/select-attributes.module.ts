import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {SelectAttributesModal} from './select-attributes';

import {LabelSingularPluralModule} from '../../../components/core/label-singular-plural/label-singular-plural.module';

@NgModule({
    declarations: [
        SelectAttributesModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        LabelSingularPluralModule
    ],
    entryComponents: [
        SelectAttributesModal
    ]
})
export class SelectAttributesModalModule {
}

