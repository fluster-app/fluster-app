import {Platform} from '@ionic/angular';

// Abstract
import {AbstractPage} from '../../../pages/abstract-page';

// Service
import {NewItemService} from '../../../services/advertise/new-item-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';

export abstract class AbstractNewAdComponent extends AbstractPage {

    protected gaEventTracked: boolean = false;

    constructor(protected newItemService: NewItemService) {
        super();
    }

    protected gaTrackEventOnce(platform: Platform, googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                               category: string, action: string) {
        if (!this.gaEventTracked) {
            this.gaTrackEvent(platform, googleAnalyticsNativeService, category, action);
            this.gaEventTracked = true;
        }
    }

    isEdit(): boolean {
        return this.newItemService.isEdit();
    }

    isActivation(): boolean {
        return this.newItemService.isActivation();
    }

}
