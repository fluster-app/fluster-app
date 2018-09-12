import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {ItemParamsPage} from './item-params.page';

import {TranslateModule} from '@ngx-translate/core';

import {FormatCurrencyPipeModule} from '../../../pipes/core/currency/format-currency-pipe.module';
import {DisplayCurrencyModule} from '../../../components/core/display-currency/display-currency.module';
import {ItemParamsInterestModule} from '../../../components/items/item-interests/item-params-interest.module';
import {ProductPickerPopoverModule} from '../../../modals/core/product-picker/product-picker.module';
import {SearchLocationModalModule} from '../../../modals/core/search-location/search-location.module';

const routes: Routes = [
    {
        path: '',
        component: ItemParamsPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        FormatCurrencyPipeModule,
        DisplayCurrencyModule,
        ItemParamsInterestModule,
        ProductPickerPopoverModule,
        SearchLocationModalModule
    ],
    declarations: [ItemParamsPage]
})
export class ItemParamsPageModule {
}
