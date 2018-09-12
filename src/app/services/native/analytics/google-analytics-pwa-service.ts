import {Injectable} from '@angular/core';

import {Resources} from '../../core/utils/resources';

// https://developers.google.com/analytics/devguides/collection/analyticsjs/pages
// https://github.com/danwilson/google-analytics-plugin/blob/master/browser/UniversalAnalyticsProxy.js

@Injectable({
    providedIn: 'root'
})
export class GoogleAnalyticsPWAService {

    private trackerInitialized: boolean = false;

    constructor() {

    }

    trackView(viewName: string) {
        this.initGoogleAnalytics().then(() => {
            this.sendTrackView(viewName).then(() => {
                // Do nothing
            });
        });
    }

    trackEvent(category: string, action: string) {
        this.initGoogleAnalytics().then(() => {
            this.sendTrackEvent(category, action).then(() => {
                // Do nothing
            });
        });
    }

    private initGoogleAnalytics(): Promise<{}> {
        return new Promise((resolve, reject) => {
            if (this.trackerInitialized) {
                resolve();
            } else {
                this.startTrackerWithId().then(() => {
                    this.setAppVersion().then(() => {
                        this.trackerInitialized = true;
                        resolve();
                    });
                });
            }
        });
    }

    private startTrackerWithId(): Promise<void> {
        return new Promise((resolve) => {
            // https://developers.google.com/analytics/devguides/collection/analyticsjs/screens
            ga('create', Resources.Constants.GOOGLE.ANALYTICS.TRACKER_ID, 'auto');
            ga('set', 'appName', 'Fluster');
            ga('set', 'anonymizeIp', true);
            resolve();
        });
    }

    private setAppVersion(): Promise<void> {
        return new Promise((resolve) => {
            ga('set', 'appVersion', Resources.Constants.APP_VERSION);
            resolve();
        });
    }

    private sendTrackView(screen: string): Promise<void> {
        return new Promise((resolve) => {
            ga('send', 'screenview', {
                screenName: screen
            });
            resolve();
        });
    }

    private sendTrackEvent(category: string, action: string): Promise<void> {
        return new Promise((resolve) => {
            ga('send', 'event', {
                eventCategory: category,
                eventAction: action
            });
            resolve();
        });
    }
}
