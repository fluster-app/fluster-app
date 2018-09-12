import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {SearchLocationModal} from './search-location';

import {SelectLocationModule} from '../../../components/core/select-location/select-location.module';

@NgModule({
    declarations: [
        SearchLocationModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        SelectLocationModule
    ],
    entryComponents: [
        SearchLocationModal
    ]
})
export class SearchLocationModalModule {
}

