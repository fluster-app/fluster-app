import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {SelectLanguagesModal} from './select-languages.modal';
import {FormsModule} from '@angular/forms';

@NgModule({
    declarations: [
        SelectLanguagesModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        FormsModule
    ],
    entryComponents: [
        SelectLanguagesModal
    ]
})
export class SelectLanguagesModalModule {
}

