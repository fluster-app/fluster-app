import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {SelectLifestyleModal} from './select-lifestyle';

import {DisplayLifestyleModule} from '../../../components/core/display-lifestyle/display-lifestyle.module';

@NgModule({
    declarations: [
        SelectLifestyleModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        DisplayLifestyleModule,
        FormsModule
    ],
    entryComponents: [
        SelectLifestyleModal
    ]
})
export class SelectLifestyleModalModule {
}

