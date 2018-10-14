import {Component, OnInit} from '@angular/core';
import {ModalController, NavParams, Platform} from '@ionic/angular';

// Abstract
import {AbstractWizardModal} from '../abstract-wizard-modal';

// Resources
import {Comparator} from '../../../services/core/utils/utils';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'select-lifestyle.html',
    selector: 'app-select-lifestyle'
})
export class SelectLifestyleModal extends AbstractWizardModal implements OnInit {

    title: string;
    keys: string[];
    selected: string;
    translationKey: string;

    constructor(protected platform: Platform,
                private modalController: ModalController,
                private navParams: NavParams,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(platform);

        this.keys = new Array();

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.SELECT_LIFESTYLE);
    }

    ngOnInit() {
        this.checkAdDisplayParams(this.navParams);
    }

    ionViewWillEnter() {
        this.title = this.navParams.get('title');
        this.keys = this.navParams.get('keys');
        this.selected = this.navParams.get('selected');
        this.translationKey = this.navParams.get('translationKey');
    }


    selectAndNavigate() {
        setTimeout(() => {
            this.close();
        }, 300);
    }

    close() {
        this.modalController.dismiss(Comparator.isStringEmpty(this.selected) ? null : this.selected).then(() => {
            // Do nothing
        });
    }

}
