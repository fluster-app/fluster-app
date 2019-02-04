import {Component} from '@angular/core';
import {AlertController, LoadingController, NavController, Platform, ToastController} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {forkJoin} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

// Abstract
import {AbstractPage} from '../../abstract-page';

// Model
import {User} from '../../../services/model/user/user';
import {Item, ItemStars} from '../../../services/model/item/item';
import {Notification} from '../../../services/model/notification/notification';
import {Applicant} from '../../../services/model/appointment/applicant';

// Utils
import {ItemsComparator} from '../../../services/core/utils/items-utils';
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {UserSessionService} from '../../../services/core/user/user-session-service';
import {CandidatesService} from '../../../services/advertise/candidates-service';
import {SubscriptionService} from '../../../services/core/user/subscription-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {NotificationService} from '../../../services/core/notification/notification-service';
import {AppointmentService} from '../../../services/core/appointment/appointment-service';
import {CandidateDetailsNavParams, NavParamsService} from '../../../services/core/navigation/nav-params-service';

@Component({
    selector: 'app-candidate-details',
    templateUrl: './candidate-details.page.html',
    styleUrls: ['./candidate-details.page.scss'],
})
export class CandidateDetailsPage extends AbstractPage {

    user: User;

    item: Item;
    candidate: User;
    starred: boolean = true;

    starredCandidateCallCallback: any;

    userProfileLoaded: boolean = false;

    constructor(private platform: Platform,
                private navController: NavController,
                private loadingController: LoadingController,
                private toastController: ToastController,
                private alertController: AlertController,
                private translateService: TranslateService,
                private userSessionService: UserSessionService,
                private candidatesService: CandidatesService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private subscriptionService: SubscriptionService,
                private notificationService: NotificationService,
                private appointmentService: AppointmentService,
                private navParamsService: NavParamsService) {
        super();

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ADS.CANDIDATES.CANDIDATES_DETAILS);
    }

    async ionViewWillEnter() {
        this.user = this.userSessionService.getUser();
        
        try {
            const candidateDetailsNavParams: CandidateDetailsNavParams = await this.navParamsService.getCandidateDetailsNavParams();

            this.item = candidateDetailsNavParams.item;
            this.candidate = candidateDetailsNavParams.candidate;
            this.starred = candidateDetailsNavParams.starred;

            this.starredCandidateCallCallback = candidateDetailsNavParams.starredCandidateCallCallback;
        } catch (err) {
            // Load no params
        }
    }

    like() {
        this.subscriptionService.couldAddSuperstar(this.item._id).then((result: boolean) => {
            if (result) {
                this.doLike();
            } else {
                this.displayAlertSubscription();
            }
        });
    }

    private displayAlertSubscription() {
        const promises = new Array();
        promises.push(this.translateService.get('CANDIDATES.STAR_ACTION.SUBSCRIPTION.TITLE'));
        promises.push(this.translateService.get('CANDIDATES.STAR_ACTION.SUBSCRIPTION.TEXT'));
        promises.push(this.translateService.get('CORE.OK'));

        forkJoin(promises).subscribe(
            async (data: string[]) => {
                if (!Comparator.isEmpty(data) && data.length === promises.length) {
                    const alert: HTMLIonAlertElement = await this.alertController.create({
                        header: data[0],
                        subHeader: data[1],
                        buttons: [{
                            text: data[2],
                            handler: () => {
                                // Do nothing
                            }
                        }]
                    });

                    await alert.present();
                }
            });
    }

    private async doLike() {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.CANDIDATES, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.CANDIDATES.SUPERSTAR);

        const loading: HTMLIonLoadingElement = await this.loadingController.create({});

        loading.present().then(() => {
            this.candidatesService.starCandidate(this.item._id, this.candidate._id).then((result: ItemStars) => {
                this.isCandidateAlreadyApplicant().then((resultAlready: boolean) => {
                    if (!resultAlready) {
                        this.sendNotification().then(() => {
                            this.navBack().then(async () => {
                                await loading.dismiss();
                            });
                        });
                    } else {
                        // We don't want to send a notification in case the applicant already have send his application
                        this.navBack().then(async () => {
                            await loading.dismiss();
                        });
                    }
                });
            }, async (response: HttpErrorResponse) => {
                await loading.dismiss();
                await this.errorMsg(this.toastController, this.translateService, 'ERRORS.ITEMS.ACTION_ERROR');
            });
        });
    }

    private navBack(): Promise<{}> {
        return new Promise((resolve) => {
            this.starredCandidateCallCallback(this.candidate._id).then(() => {
                this.navController.navigateBack('/candidates').then(() => {
                    resolve();
                }, (err: any) => {
                    resolve();
                });
            });
        });
    }

    // Notification
    private sendNotification(): Promise<{}> {
        return new Promise((resolve) => {
            this.notificationService.send(this.user, this.candidate, this.item, this.item.appointment, null, this.RESOURCES.NOTIFICATION.TYPE.SUPERSTAR_NEW).then((notification: Notification) => {
                resolve();
            }, (response: HttpErrorResponse) => {
                // We ignore the notifications error
                resolve();
            });
        });
    }

    private isCandidateAlreadyApplicant(): Promise<{}> {
        return new Promise((resolve) => {
            this.appointmentService.findApplicants(this.item._id, this.item.appointment._id, null, false, null, false, null, this.candidate._id).then((results: Applicant[]) => {
                resolve(Comparator.hasElements(results));
            }, (response: HttpErrorResponse) => {
                // We ignore the error
                resolve(true);
            });
        });
    }

    setUserProfileLoaded(value: boolean) {
        this.userProfileLoaded = value;
    }

    isItemShare(): boolean {
        return ItemsComparator.isItemShare(this.item);
    }

    isItemFlat(): boolean {
        return ItemsComparator.isItemFlat(this.item);
    }

    hasItem(): boolean {
        return !Comparator.isEmpty(this.item);
    }

}
