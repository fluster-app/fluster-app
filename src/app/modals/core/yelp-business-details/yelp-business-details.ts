import {Component, ViewChild} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

// Model
import {Item} from '../../../services/model/item/item';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

// Modal
import {AbstractModal} from '../abstract-modal';

// Services
import {YelpService} from '../../../services/core/yelp/yelp-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {ModalController, NavParams, Platform} from '@ionic/angular';

@Component({
    templateUrl: 'yelp-business-details.html',
    styleUrls: ['./yelp-business-details.scss'],
    selector: 'app-yelp-business-details'
})
export class YelpBusinessDetailsModal extends AbstractModal {

    item: Item;

    yelpBusiness: Yelp.YelpBusiness;

    yelpBusinessDetails: Yelp.YelpBusinessDetails;

    yelpMarkers: Yelp.YelpBusiness[];

    yelpImages: string[];

    constructor(private platform: Platform,
                private modalController: ModalController,
                private navParams: NavParams,
                private yelpService: YelpService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super();
    }

    ionViewWillEnter() {
        this.item = this.navParams.get('item');

        this.checkAdDisplayParams(this.navParams);

        this.yelpBusiness = this.navParams.get('yelpBusiness');

        this.yelpMarkers = new Array();
        this.yelpMarkers.push(this.yelpBusiness);

        this.yelpService.get(this.yelpBusiness).then((result: Yelp.YelpBusinessDetails) => {
            this.yelpBusinessDetails = result;

            if (!Comparator.isEmpty(this.yelpBusinessDetails.photos)) {
                this.yelpImages = this.yelpBusinessDetails.photos;
            } else {
                this.yelpImages = new Array();
                this.yelpImages.push(this.yelpBusiness.image_url);
            }

        }, (error: HttpErrorResponse) => {
            this.yelpImages = new Array();
            this.yelpImages.push(this.yelpBusiness.image_url);
        });

        this.gaTrack();
    }

    private gaTrack() {
        if (this.isAdDisplay) {
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.YELP_DETAILS);
        } else {
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.BROWSE.YELP_DETAILS);
        }
    }

    async close() {
        await this.modalController.dismiss();
    }

    hasPhone(): boolean {
        return this.yelpBusiness != null && !Comparator.isStringEmpty(this.yelpBusiness.phone);
    }
}
