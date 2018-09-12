import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {GoogleMapYelpComponent} from './google-map-yelp';

@NgModule({
    declarations: [
        GoogleMapYelpComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        GoogleMapYelpComponent
    ]
})
export class GoogleMapYelpModule {
}
