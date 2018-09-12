import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {SelectInterestModal} from './select-interest';

import {SelectLocationModule} from '../../../components/core/select-location/select-location.module';
import {BigButtonModule} from '../../../components/core/big-button/big-button.module';

@NgModule({
    declarations: [
        SelectInterestModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        SelectLocationModule,
        BigButtonModule
    ],
    entryComponents: [
        SelectInterestModal
    ]
})
export class SelectInterestModalModule {
}

