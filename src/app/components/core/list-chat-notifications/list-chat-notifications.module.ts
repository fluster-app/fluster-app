import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ListChatNotificationsComponent} from './list-chat-notifications';
import {DisplayDateModule} from '../display-date/display-date.module';

@NgModule({
    declarations: [
        ListChatNotificationsComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        DisplayDateModule
    ],
    exports: [
        ListChatNotificationsComponent
    ]
})
export class ListChatNotificationsModule {
}
