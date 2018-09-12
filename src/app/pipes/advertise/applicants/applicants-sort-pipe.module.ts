import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ApplicantsSortPipe} from './applicants-sort-pipe';

@NgModule({
    declarations: [
        ApplicantsSortPipe
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        ApplicantsSortPipe
    ]
})
export class ApplicantsSortPipeModule {
}
