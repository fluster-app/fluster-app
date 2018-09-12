import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {UserProfileInputPhoneComponent} from './user-profile-input-phone';

@NgModule({
    declarations: [
        UserProfileInputPhoneComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule.forChild()
    ],
    exports: [
        UserProfileInputPhoneComponent
    ]
})
export class UserProfileInputPhoneModule {
}
