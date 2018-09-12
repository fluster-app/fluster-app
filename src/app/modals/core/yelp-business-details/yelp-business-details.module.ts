import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {YelpBusinessDetailsModal} from './yelp-business-details';

import {ImageLoaderModule} from '../../../components/core/image-loader/image-loader.module';
import {GoogleMapYelpModule} from '../../../components/items/map/google-map-yelp/google-map-yelp.module';
import {TrimDistancePipeModule} from '../../../pipes/core/distance/distance-pipe.module';

@NgModule({
    declarations: [
        YelpBusinessDetailsModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild(),
        ImageLoaderModule,
        GoogleMapYelpModule,
        TrimDistancePipeModule
    ],
    entryComponents: [
        YelpBusinessDetailsModal
    ]
})
export class YelpBusinessDetailsModalModule {
}

