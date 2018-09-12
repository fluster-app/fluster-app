import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {TrimDistancePipe} from './distance-pipe';

@NgModule({
    declarations: [
        TrimDistancePipe
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        TrimDistancePipe
    ]
})
export class TrimDistancePipeModule {
}
