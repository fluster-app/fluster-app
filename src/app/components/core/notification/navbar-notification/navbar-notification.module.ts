import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {NavbarNotificationComponent} from './navbar-notification';

@NgModule({
    declarations: [
        NavbarNotificationComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        NavbarNotificationComponent
    ]
})
export class NavbarNotificationModule {
}
