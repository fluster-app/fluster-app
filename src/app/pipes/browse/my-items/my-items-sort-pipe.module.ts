import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {MyItemsSortPipe} from './my-items-sort-pipe';

@NgModule({
    declarations: [
        MyItemsSortPipe
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        MyItemsSortPipe
    ]
})
export class MyItemsSortPipeModule {
}
