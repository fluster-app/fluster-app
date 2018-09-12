import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {NoItemsComponent} from './no-items';
import {UserProfileImgModule} from '../../core/user-profile/user-profile-img.module';

@NgModule({
    declarations: [
        NoItemsComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        UserProfileImgModule
    ],
    exports: [
        NoItemsComponent
    ]
})
export class NoItemsModule {
}
