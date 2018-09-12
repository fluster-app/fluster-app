import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {GoogleMapItemComponent} from './google-map-item';

@NgModule({
    declarations: [
        GoogleMapItemComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        GoogleMapItemComponent
    ]
})
export class GoogleMapItemModule {
}
