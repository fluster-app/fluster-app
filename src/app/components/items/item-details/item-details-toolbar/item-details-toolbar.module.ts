import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {ItemDetailsToolbarComponent} from './item-details-toolbar';

@NgModule({
    declarations: [
        ItemDetailsToolbarComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule.forChild()
    ],
    exports: [
        ItemDetailsToolbarComponent
    ]
})
export class ItemDetailsToolbarModule {
}
