import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {TargetedUsersModule} from '../../targeted-users/targeted-users.module';
import {NewAdStepLifestyleComponent} from './new-ad-step-lifestyle';
import {LabelSingularPluralModule} from '../../../core/label-singular-plural/label-singular-plural.module';
import {ListLifestyleHobbiesModule} from '../../../core/list-lifestyle-hobbies/list-lifestyle.module-hobbies';

@NgModule({
    declarations: [
        NewAdStepLifestyleComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        TargetedUsersModule,
        LabelSingularPluralModule,
        ListLifestyleHobbiesModule
    ],
    exports: [
        NewAdStepLifestyleComponent
    ]
})
export class NewAdStepLifestyleModule {
}
