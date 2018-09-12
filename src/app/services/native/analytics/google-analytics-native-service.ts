import {Injectable} from '@angular/core';

import {environment} from '../../../../environments/environment';

// Services
import {GoogleAnalyticsPWAService} from './google-analytics-pwa-service';
import {GoogleAnalyticsCordovaService} from './google-analytics-cordova-service';

@Injectable({
    providedIn: 'root'
})
export class GoogleAnalyticsNativeService {

    constructor(private googleAnalyticsCordovaService: GoogleAnalyticsCordovaService,
                private googleAnalyticsPWAService: GoogleAnalyticsPWAService) {

    }

    trackView(viewName: string) {

        //removeIf(production)
        if (!environment.production) {
            return;
        }
        //endRemoveIf(production)

        if (environment.cordova) {
            this.googleAnalyticsCordovaService.trackView(viewName);
        } else {
            this.googleAnalyticsPWAService.trackView(viewName);
        }
    }

    trackEvent(category: string, action: string) {

        //removeIf(production)
        if (!environment.production) {
            return;
        }
        //endRemoveIf(production)

        if (environment.cordova) {
            this.googleAnalyticsCordovaService.trackEvent(category, action);
        } else {
            this.googleAnalyticsPWAService.trackEvent(category, action);
        }
    }


}
