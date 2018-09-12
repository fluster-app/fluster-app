import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {NavbarOnScrollDirective} from './navbar-on-scroll.directive';

@NgModule({
    declarations: [
        NavbarOnScrollDirective
    ],
    imports: [
        IonicModule,
        CommonModule
    ],
    exports: [
        NavbarOnScrollDirective
    ]
})
export class NavbarOnScrollDirectiveModule {
}
