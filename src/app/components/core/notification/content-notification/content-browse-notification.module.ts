import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ContentBrowseNotificationComponent} from './content-browse-notification';
import {DisplayDateModule} from '../../display-date/display-date.module';

@NgModule({
    declarations: [
        ContentBrowseNotificationComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        DisplayDateModule
    ],
    exports: [
        ContentBrowseNotificationComponent
    ]
})
export class ContentBrowseNotificationModule {
}
