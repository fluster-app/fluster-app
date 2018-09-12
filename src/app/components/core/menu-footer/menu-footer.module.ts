import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';
import {MenuFooterComponent} from './menu-footer';

@NgModule({
    declarations: [
        MenuFooterComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        MenuFooterComponent
    ]
})
export class MenuFooterModule {
}
