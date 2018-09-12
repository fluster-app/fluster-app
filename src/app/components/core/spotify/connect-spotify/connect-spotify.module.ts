import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {ConnectSpotifyComponent} from './connect-spotify';

@NgModule({
    declarations: [
        ConnectSpotifyComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule.forChild()
    ],
    exports: [
        ConnectSpotifyComponent
    ]
})
export class ConnectSpotifyModule {
}
