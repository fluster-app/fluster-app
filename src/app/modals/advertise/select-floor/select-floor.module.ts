import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {SelectFloorModal} from './select-floor';

import {DisplayFloorModule} from '../../../components/core/display-floor/display-floor.module';

@NgModule({
    declarations: [
        SelectFloorModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        DisplayFloorModule
    ],
    entryComponents: [
        SelectFloorModal
    ]
})
export class SelectFloorModalModule {
}

