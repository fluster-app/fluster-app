import {Injectable} from '@angular/core';
import {GoogleAnalytics} from '@ionic-native/google-analytics/ngx';

import {forkJoin} from 'rxjs';

// Utils and resources
import {Resources} from '../../core/utils/resources';
import {Comparator} from '../../core/utils/utils';

export class GAEvent {
    viewName: string;
    category: string;
    action: string;
}

@Injectable({
    providedIn: 'root'
})
export class GoogleAnalyticsCordovaService {

    private eventsNotSent: GAEvent[] = new Array();
    private trackerInitialized: boolean = false;

    constructor(private googleAnalytics: GoogleAnalytics) {

    }

    trackView(viewName: string) {
        if (typeof window.analytics === 'undefined') {
            this.eventsNotSent.push({viewName: viewName, category: null, action: null});
        } else {
            this.initGoogleAnalytics().then(() => {
                this.trackEventsNotSent().then(() => {
                    this.googleAnalytics.trackView(viewName).then(() => {
                        // Do nothing
                    });
                });
            }, (error: any) => {
                this.eventsNotSent.push({viewName: viewName, category: null, action: null});
            });
        }
    }

    trackEvent(category: string, action: string) {
        if (typeof window.analytics === 'undefined') {
            this.eventsNotSent.push({viewName: null, category: category, action: action});
        } else {
            this.initGoogleAnalytics().then(() => {
                this.trackEventsNotSent().then(() => {
                    this.googleAnalytics.trackEvent(category, action).then(() => {
                        // Do nothing
                    });
                });
            }, (error: any) => {
                this.eventsNotSent.push({viewName: null, category: category, action: action});
            });
        }
    }

    private trackEventsNotSent(): Promise<{}> {
        return new Promise((resolve) => {
            if (Comparator.isEmpty(this.eventsNotSent)) {
                resolve();
            } else {
                const promises = new Array();

                for (let i: number = 0; i < this.eventsNotSent.length; i++) {
                    if (!Comparator.isStringEmpty(this.eventsNotSent[i].viewName)) {
                        promises.push(this.googleAnalytics.trackView(this.eventsNotSent[i].viewName));
                    } else {
                        promises.push(this.googleAnalytics.trackEvent(this.eventsNotSent[i].category, this.eventsNotSent[i].action));
                    }
                }

                forkJoin(promises).subscribe(
                    (data: any) => {
                        this.eventsNotSent = new Array();
                        resolve();
                    });
            }
        });
    }

    private initGoogleAnalytics(): Promise<{}> {
        return new Promise((resolve, reject) => {
            if (this.trackerInitialized) {
                resolve();
            } else {
                this.googleAnalytics.startTrackerWithId(Resources.Constants.GOOGLE.ANALYTICS.TRACKER_ID).then(() => {
                    this.googleAnalytics.setAnonymizeIp(true).then(() => {
                        this.googleAnalytics.setAppVersion(Resources.Constants.APP_VERSION).then(() => {
                            this.trackerInitialized = true;
                            resolve();
                        }, (error: any) => {
                            // GA init is ok
                            this.trackerInitialized = true;
                            resolve();
                        });
                    }, (error: any) => {
                        // GA init is ok
                        this.trackerInitialized = true;
                        resolve();
                    });
                }).catch((error: any) => {
                    // Do nothing
                    this.trackerInitialized = false;
                    reject(error);
                });
            }
        });
    }
}
