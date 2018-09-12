import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {SelectHobbiesModal} from './select-hobbies';
import {FormsModule} from '@angular/forms';

@NgModule({
    declarations: [
        SelectHobbiesModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        FormsModule
    ],
    entryComponents: [
        SelectHobbiesModal
    ]
})
export class SelectHobbiesModalModule {
}

