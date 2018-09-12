import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {UserInfoComponent} from './user-info';

@NgModule({
    declarations: [
        UserInfoComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        UserInfoComponent
    ]
})
export class UserInfoModule {
}
