import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {FirstChoicePage} from './first-choice.page';

import {TranslateModule} from '@ngx-translate/core';

import {BigButtonModule} from '../../../components/core/big-button/big-button.module';

const routes: Routes = [
    {
        path: '',
        component: FirstChoicePage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        BigButtonModule
    ],
    declarations: [FirstChoicePage]
})
export class FirstChoicePageModule {
}
