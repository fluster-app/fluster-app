import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {DisplayHobbiesComponent} from './display-hobbies';

@NgModule({
    declarations: [
        DisplayHobbiesComponent
    ],
    imports: [
        IonicModule,
        CommonModule
    ],
    exports: [
        DisplayHobbiesComponent
    ]
})
export class DisplayHobbiesModule {
}
