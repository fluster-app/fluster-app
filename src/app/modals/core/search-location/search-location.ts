import {Component} from '@angular/core';
import {ModalController, NavParams, Platform} from '@ionic/angular';

// Modal
import {AbstractWizardModal} from '../abstract-wizard-modal';

// Model
import {Address, SearchLocationResults} from '../../../services/model/utils/address';

// Services
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'search-location.html',
    selector: 'app-search-location'
})
export class SearchLocationModal extends AbstractWizardModal {

    constructor(protected platform: Platform,
                private modalController: ModalController,
                private navParams: NavParams,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(platform);

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.SEARCH_LOCATION);
    }

    ionViewWillEnter() {
        this.checkAdDisplayParams(this.navParams);
    }

    selectAndNavigate(selectedLocation: Address) {
        const results: SearchLocationResults = {selectedLocation: selectedLocation};

        this.modalController.dismiss(results).then(() => {
            // Do nothing
        });
    }

    close() {
        this.modalController.dismiss(null).then(() => {
            // Do nothing
        });
    }

}
