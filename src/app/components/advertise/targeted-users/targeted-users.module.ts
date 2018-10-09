import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {TargetedUsersComponent} from './targeted-users';

@NgModule({
    declarations: [
        TargetedUsersComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        TargetedUsersComponent
    ]
})
export class TargetedUsersModule {
}
