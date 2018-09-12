import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {ItemDetailsContentComponent} from './item-details-content';
import {ItemDetailsToolbarModule} from '../item-details-toolbar/item-details-toolbar.module';
import {DisplayCurrencyModule} from '../../../core/display-currency/display-currency.module';
import {DisplayFloorModule} from '../../../core/display-floor/display-floor.module';
import {GoogleMapItemModule} from '../../map/google-map-item/google-map-item.module';
import {ItemInterestsModule} from '../../item-interests/item-interests.module';
import {PublicUserProfileModule} from '../../../user/public-user-profile/public-user-profile.module';
import {TrimDistancePipeModule} from '../../../../pipes/core/distance/distance-pipe.module';
import {YelpBusinessesSortPipeModule} from '../../../../pipes/core/yelp/yelp-businesses-sort-pipe.module';
import {YelpBusinessDetailsModalModule} from '../../../../modals/core/yelp-business-details/yelp-business-details.module';

@NgModule({
    declarations: [
        ItemDetailsContentComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        ItemDetailsToolbarModule,
        DisplayCurrencyModule,
        DisplayFloorModule,
        GoogleMapItemModule,
        ItemInterestsModule,
        PublicUserProfileModule,
        TrimDistancePipeModule,
        YelpBusinessesSortPipeModule,
        YelpBusinessDetailsModalModule
    ],
    exports: [
        ItemDetailsContentComponent
    ]
})
export class ItemDetailsContentModule {
}
