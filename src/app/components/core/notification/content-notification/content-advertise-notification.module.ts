import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';
import {ContentAdvertiseNotificationComponent} from './content-advertise-notification';


@NgModule({
    declarations: [
        ContentAdvertiseNotificationComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        ContentAdvertiseNotificationComponent
    ]
})
export class ContentAdvertiseNotificationModule {
}
