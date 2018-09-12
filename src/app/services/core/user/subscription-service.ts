import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';

// Model
import {FreemiumRules, Subscription} from '../../model/user/user';
import LikeCount = Communication.LikeCount;

// Utils
import {Comparator, Converter} from '../utils/utils';
import {Resources} from '../utils/resources';

// Services
import {AccessTokenService} from './access-token-service';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionService {

    private subscription: Subscription;
    private freemiumRules: FreemiumRules;

    private countDailyLikes: number = null;

    private countDailySuperstars: number = null;

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService) {

    }

    setFreemiumRules(new_freemiumRules: FreemiumRules) {
        this.freemiumRules = new_freemiumRules;
    }

    getFreemiumRules(): FreemiumRules {
        return this.freemiumRules;
    }

    setSubscription(new_subscription: Subscription) {
        this.subscription = new_subscription;
    }

    getSubscription(): Subscription {
        return this.subscription;
    }

    couldReviewDisliked(): boolean {
        // Allowed if freemium allows it or if user has an active browse subscription
        return !Comparator.isEmpty(this.freemiumRules) && !Comparator.isEmpty(this.freemiumRules.browse) &&
            (this.freemiumRules.browse.reviewDisliked || this.isSubscriptionBrowseActive());
    }

    couldViewApplicants(): boolean {
        // Allowed if freemium allows it or if user has an active browse subscription
        return !Comparator.isEmpty(this.freemiumRules) && !Comparator.isEmpty(this.freemiumRules.browse) &&
            (this.freemiumRules.browse.viewApplicants || this.isSubscriptionBrowseActive());
    }

    couldChangeDistance(): boolean {
        // Allowed if freemium allows it or if user has an active browse subscription
        return !Comparator.isEmpty(this.freemiumRules) && !Comparator.isEmpty(this.freemiumRules.browse) &&
            (this.freemiumRules.browse.changeDistance || this.isSubscriptionBrowseActive());
    }

    couldChangeBudget(): boolean {
        // Allowed if freemium allows it or if user has an active browse subscription
        return !Comparator.isEmpty(this.freemiumRules) && !Comparator.isEmpty(this.freemiumRules.browse) &&
            (this.freemiumRules.browse.changeBudget || this.isSubscriptionBrowseActive());
    }

    couldAddInterest(index: number): boolean {
        // Allowed if index is smaller than freemium limit max interests or if subscription is active and browse
        return !Comparator.isEmpty(this.freemiumRules) && !Comparator.isEmpty(this.freemiumRules.browse) &&
            (index < this.freemiumRules.browse.maxInterests || this.isSubscriptionBrowseActive());
    }

    couldAddLike(): Promise<{}> {
        return new Promise((resolve) => {
            if (this.countDailyLikes == null) {
                this.countTodayApplications().then((result: LikeCount) => {
                    this.countDailyLikes = Comparator.isEmpty(result) ? 0 : result.count;
                    resolve(this.isMaxDailyLikesReached());
                }, (errorResponse: HttpErrorResponse) => {
                    this.countDailyLikes = null;
                    resolve(false);
                });
            } else {
                resolve(this.isMaxDailyLikesReached());
            }
        });
    }

    private isMaxDailyLikesReached(): boolean {
        this.countDailyLikes++;

        return !Comparator.isEmpty(this.freemiumRules) && !Comparator.isEmpty(this.freemiumRules.browse) &&
            (this.countDailyLikes <= this.freemiumRules.browse.maxDailyLikes || this.isSubscriptionBrowseActive());
    }

    private isSubscriptionBrowseActive(): boolean {
        return this.isSubscriptionActive() && this.subscription.browse;
    }

    private isSubscriptionAdActive(): boolean {
        return this.isSubscriptionActive() && !this.subscription.browse;
    }

    isSubscriptionActive(): boolean {
        if (Comparator.isEmpty(this.subscription)) {
            return false;
        }

        if (!Comparator.equals(this.subscription.status, Resources.Constants.SUBSCRIPTION.STATUS.ACTIVE) &&
            !Comparator.equals(this.subscription.status, Resources.Constants.SUBSCRIPTION.STATUS.ACKNOWLEDGED)) {
            return false;
        }

        const end: Date = Converter.getDateObj(this.subscription.end);

        return !Comparator.isEmpty(this.subscription) && end != null && end.getTime() > Date.now();
    }

    private countTodayApplications(): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const params: HttpParams = await this.accessTokenService.getHttpParams();

                this.httpClient.get(Resources.Constants.API.LIKES + 'count', {params: params})
                    .subscribe((response: LikeCount) => {
                        resolve(response);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    reset() {
        this.subscription = null;
        this.freemiumRules = null;
        this.countDailyLikes = null;
        this.countDailySuperstars = null;
    }

    findSubscriptions(userIds: string[], browse: boolean): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();
                params = params.append('userIds', userIds.join());
                params = params.append('browse', '' + browse);

                this.httpClient.get(Resources.Constants.API.SUBSCRIPTIONS, {params: params})
                    .subscribe((data: string[]) => {
                        resolve(data);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    couldAddSuperstar(itemId: string): Promise<{}> {
        return new Promise((resolve) => {
            if (this.countDailySuperstars == null) {
                this.countTodaySuperstars(itemId).then((result: LikeCount) => {
                    this.countDailySuperstars = Comparator.isEmpty(result) ? 0 : result.count;
                    resolve(this.isMaxDailySuperstarsReached());
                }, (errorResponse: HttpErrorResponse) => {
                    this.countDailySuperstars = null;
                    resolve(false);
                });
            } else {
                resolve(this.isMaxDailySuperstarsReached());
            }
        });
    }

    private isMaxDailySuperstarsReached(): boolean {
        this.countDailySuperstars++;

        return !Comparator.isEmpty(this.freemiumRules) && !Comparator.isEmpty(this.freemiumRules.ad) &&
            (this.countDailySuperstars <= this.freemiumRules.ad.maxDailySuperstars || this.isSubscriptionAdActive());
    }

    private countTodaySuperstars(itemId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                params = params.append('itemId', itemId);

                this.httpClient.get(Resources.Constants.API.STARS + 'count', {params: params})
                    .subscribe((response: LikeCount) => {
                        resolve(response);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }
}
