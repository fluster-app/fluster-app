import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {UserProfileInputBioComponent} from './user-profile-input-bio';

@NgModule({
    declarations: [
        UserProfileInputBioComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule.forChild()
    ],
    exports: [
        UserProfileInputBioComponent
    ]
})
export class UserProfileInputBioModule {
}
