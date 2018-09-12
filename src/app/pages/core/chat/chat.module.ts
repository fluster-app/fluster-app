import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {TranslateModule} from '@ngx-translate/core';

import {IonicModule} from '@ionic/angular';

import {ChatPage} from './chat.page';
import {UserProfileImgModule} from '../../../components/core/user-profile/user-profile-img.module';
import {DisplayDateModule} from '../../../components/core/display-date/display-date.module';
import {ToolbarUserTitleModule} from '../../../components/core/toolbar-user-title/toolbar-user-title.module';
import {RescheduleAppointmentsModalModule} from '../../../modals/advertise/reschedule-appointments/reschedule-appointments.module';

const routes: Routes = [
    {
        path: '',
        component: ChatPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        UserProfileImgModule,
        DisplayDateModule,
        ToolbarUserTitleModule,
        RescheduleAppointmentsModalModule
    ],
    declarations: [ChatPage]
})
export class ChatPageModule {
}
