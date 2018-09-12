import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {PublicUserSkeletonProfileComponent} from './public-user-skeleton-profile';

@NgModule({
    declarations: [
        PublicUserSkeletonProfileComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild()
    ],
    exports: [
        PublicUserSkeletonProfileComponent
    ]
})
export class PublicUserSkeletonProfileModule {
}
