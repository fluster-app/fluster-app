import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {DisplaySpotifyComponent} from './display-spotify';

@NgModule({
    declarations: [
        DisplaySpotifyComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        DisplaySpotifyComponent
    ]
})
export class DisplaySpotifyModule {
}
