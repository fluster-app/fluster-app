import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ListLifestyleHobbiesComponent} from './list-lifestyle-hobbies';
import {DisplayLifestyleModule} from '../display-lifestyle/display-lifestyle.module';
import {SelectLifestyleModalModule} from '../../../modals/core/select-lifestyle/select-lifestyle.module';
import {SelectHobbiesModalModule} from '../../../modals/core/select-hobbies/select-hobbies.module';

@NgModule({
    declarations: [
        ListLifestyleHobbiesComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        DisplayLifestyleModule,
        SelectLifestyleModalModule,
        SelectHobbiesModalModule
    ],
    exports: [
        ListLifestyleHobbiesComponent
    ]
})
export class ListLifestyleHobbiesModule {
}
