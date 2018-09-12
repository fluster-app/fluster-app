import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {WebSocialShareComponent} from './web-social-share';

@NgModule({
    declarations: [
        WebSocialShareComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        WebSocialShareComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WebSocialShareModule {
}
