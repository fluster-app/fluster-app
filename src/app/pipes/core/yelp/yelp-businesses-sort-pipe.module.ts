import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {YelpBusinessesSortPipe} from './yelp-businesses-sort-pipe';

@NgModule({
    declarations: [
        YelpBusinessesSortPipe
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        YelpBusinessesSortPipe
    ]
})
export class YelpBusinessesSortPipeModule {
}
