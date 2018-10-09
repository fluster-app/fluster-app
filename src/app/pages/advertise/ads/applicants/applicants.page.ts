import {Component, OnInit} from '@angular/core';
import {AlertController, App, LoadingController, MenuController, NavController, Platform, ToastController} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {forkJoin} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {SplashScreen} from '@ionic-native/splash-screen/ngx';

// Pages
import {AbstractAdsPage} from '../abstract-ads';

// Model
import {Applicant} from '../../../../services/model/appointment/applicant';
import {Item} from '../../../../services/model/item/item';
import {Appointment} from '../../../../services/model/appointment/appointment';
import {User} from '../../../../services/model/user/user';

// Resources and utils
import {Comparator} from '../../../../services/core/utils/utils';
import {ApplicantsComparator} from '../../../../services/core/utils/applicant-utils';

// Services
import {AppointmentService} from '../../../../services/core/appointment/appointment-service';
import {AdsService} from '../../../../services/advertise/ads-service';
import {NotificationWatcherService} from '../../../../services/core/notification/notification-watcher-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {LoginService} from '../../../../services/core/login/login-service';
import {AccessTokenService} from '../../../../services/core/user/access-token-service';
import {SubscriptionService} from '../../../../services/core/user/subscription-service';
import {CandidatesService} from '../../../../services/advertise/candidates-service';
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {LocalFilesService} from '../../../../services/native/localfiles/local-files-service';
import {UserProfileService} from '../../../../services/core/user/user-profile-service';
import {UserSessionService} from '../../../../services/core/user/user-session-service';
import {StorageService} from '../../../../services/core/localstorage/storage-service';
import {NavParamsService} from '../../../../services/core/navigation/nav-params-service';

@Component({
    selector: 'app-applicants',
    templateUrl: './applicants.page.html',
    styleUrls: ['./applicants.page.scss'],
})
export class ApplicantsPage extends AbstractAdsPage {

    applicants: Applicant[];
    subscriptionIds: string[];

    item: Item;
    appointment: Appointment;

    private pageIndex: number = 0;
    private lastPageReached: boolean = false;
    private initialized: boolean = false;

    constructor(private app: App,
                protected platform: Platform,
                protected navController: NavController,
                private menuController: MenuController,
                protected loadingController: LoadingController,
                protected toastController: ToastController,
                private alertController: AlertController,
                private splashScreen: SplashScreen,
                protected translateService: TranslateService,
                private loginService: LoginService,
                private appointmentService: AppointmentService,
                protected adsService: AdsService,
                protected newItemService: NewItemService,
                private notificationWatcherService: NotificationWatcherService,
                protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                protected localFilesService: LocalFilesService,
                private accessTokenService: AccessTokenService,
                private subscriptionService: SubscriptionService,
                protected candidatesService: CandidatesService,
                private userProfileService: UserProfileService,
                private userSessionService: UserSessionService,
                private storageService: StorageService,
                protected navParamsService: NavParamsService) {
        super(platform, loadingController, navController, toastController, translateService, googleAnalyticsNativeService, adsService, newItemService, localFilesService, candidatesService, navParamsService);

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ADS.APPLICANTS);

        this.pageIndex = 0;
        this.lastPageReached = false;
        this.initialized = false;
    }

    async ionViewWillEnter() {
        this.init();

        this.hideSplashScreen(this.platform, this.splashScreen, this.loginService);

        await this.enableMenu(this.menuController, false, true);
    }

    async ionViewDidEnter() {
        const user: User = this.userSessionService.getUser();
        await this.saveUserIfNeeded(this.toastController, this.loadingController, this.translateService, this.userProfileService, this.userSessionService, user);
    }

    ionViewWillLeave() {
        this.notificationWatcherService.resetAdvertiseNotifications();
    }

    private init() {
        if (!Comparator.isEmpty(this.adsService.getSelectedItem())) {
            this.item = this.adsService.getSelectedItem();
            this.initApplicants();
        } else {
            this.initFindItems();
        }
    }

    reset() {
        if (Comparator.isEmpty(this.accessTokenService.getAccessToken())) {
            return;
        }

        if (!this.initialized) {
            // A notification could happens in same time as we loggin, which gonna double the list of applications
            // Here we check that the init is done before refreshing the list in case of notifications
            return;
        }

        this.pageIndex = 0;
        this.lastPageReached = false;
        this.initialized = false;

        this.applicants = new Array();

        this.initFindItems();
    }

    private initFindItems() {
        // First init item
        this.adsService.findAdsItems().then((items: Item[]) => {
            // Right now we only support one item pro advertiser
            this.item = !Comparator.isEmpty(items) ? items[0] : null;
            this.adsService.setSelectedItem(this.item);

            this.initApplicants();
        }, (errorResponse: HttpErrorResponse) => {
            this.adsService.setSelectedItem(this.item);
            this.item = null;
            this.initApplicants();
        });
    }

    // Find items

    private initApplicants() {
        if (this.item != null) {
            const promises = new Array();

            promises.push(this.findApplicants());
            promises.push(this.findStarredCandidates());

            forkJoin(promises).subscribe(
                () => {
                    // Do nothing
                });
        } else {
            // No item, display no applicants screen
            this.buildApplicantsArray();
        }
    }

    findNextApplicants(event) {
        this.findApplicants().then(() => {
            event.target.complete();
        });
    }

    private findApplicants(): Promise<{}> {
        return new Promise((resolve) => {
            this.appointmentService.findApplicants(this.item._id, this.item.appointment._id, null, true, this.pageIndex, false, null, null).then((results: Applicant[]) => {

                this.findNewApplicantUsers(results).then((userIds: string[]) => {
                    if (Comparator.hasElements(userIds)) {
                        this.findSubscriptions(userIds).then(() => {
                            this.feedApplicants(results);
                            resolve();
                        });
                    } else {
                        this.feedApplicants(results);
                        resolve();
                    }
                });
            }, (errorResponse: HttpErrorResponse) => {
                // Nothing found.
                this.lastPageReached = true;
                this.initialized = true;

                this.buildApplicantsArray();

                resolve();
            });
        });
    }

    private findSubscriptions(userIds: string[]): Promise<{}> {
        return new Promise((resolve) => {
            this.subscriptionService.findSubscriptions(userIds, true).then((subscriptions: string[]) => {
                this.subscriptionIds = subscriptions;
                resolve();
            }, (errorResponse: HttpErrorResponse) => {
                // Empty array so don't have to check for null in pipes
                this.subscriptionIds = new Array();
                resolve();
            });
        });
    }

    private feedApplicants(results: Applicant[]) {
        this.buildApplicantsArray();

        this.applicants = this.applicants.concat(results);

        this.pageIndex += 1;

        if (Comparator.isEmpty(results) || results.length < this.RESOURCES.API.PAGINATION.COMMON) {
            this.lastPageReached = true;
        }

        this.initialized = true;
    }

    private findNewApplicantUsers(applicantList: Applicant[]): Promise<{}> {
        return new Promise((resolve) => {
            if (!Comparator.hasElements(applicantList)) {
                resolve(null);
            } else {
                const results: string[] = new Array();

                for (let i: number = 0; i < applicantList.length; i++) {
                    const applicant: Applicant = applicantList[i];

                    if (this.isStatusNew(applicant) && !Comparator.isEmpty(applicant.user) && this.isUserValid(applicant.user)) {
                        results.push(applicantList[i].user._id);
                    }
                }

                resolve(results);
            }
        });
    }

    private isUserValid(user: User): boolean {
        return !Comparator.equals(user.status, this.RESOURCES.USER.STATUS.DELETED) && !Comparator.equals(user.status, this.RESOURCES.USER.STATUS.BLOCKED);
    }

    private buildApplicantsArray() {
        if (this.applicants == null) {
            this.applicants = new Array<Applicant>();
        }
    }

    isLastPageReached(): boolean {
        return this.lastPageReached;
    }

    isStatusNew(applicant: Applicant): boolean {
        return Comparator.equals(this.RESOURCES.APPLICANT.STATUS.NEW, applicant.status);
    }

    isStatusAccepted(applicant: Applicant): boolean {
        return Comparator.equals(this.RESOURCES.APPLICANT.STATUS.ACCEPTED, applicant.status);
    }

    isStatusCancelled(applicant: Applicant): boolean {
        return Comparator.equals(this.RESOURCES.APPLICANT.STATUS.CANCELLED, applicant.status);
    }

    isStatusToReschedule(applicant: Applicant): boolean {
        return Comparator.equals(this.RESOURCES.APPLICANT.STATUS.TO_RESCHEDULE, applicant.status);
    }

    couldChat(applicant: Applicant): boolean {
        return ApplicantsComparator.couldChat(applicant);
    }

    tagsUpdateApplicant = (updateApplicant: Applicant, applicantIndex: number): Promise<{}> => {
        return new Promise((resolve) => {
            if (Comparator.hasElements(this.applicants) && this.applicants.length > applicantIndex) {
                this.applicants[applicantIndex] = updateApplicant;

                this.explainReschedule(updateApplicant);
            }

            resolve();
        });
    }

    navigate(applicant: Applicant, index: number) {
        if (this.couldChat(applicant)) {
            this.navigateToChat(applicant);
        } else {
            this.navigateToAppointmentChoice(applicant, index);
        }
    }

    navigateToChat(applicant: Applicant) {
        this.navParamsService.setChatNavParams({
            applicant: applicant,
            item: this.item,
            adDisplay: true,
            userStarred: this.isApplicantStarred(applicant)
        });

        this.navController.navigateForward('/chat');
    }

    navigateToAppointmentChoice(applicant: Applicant, index: number) {
        this.notificationWatcherService.resetAdvertiseNotifications();

        this.navParamsService.setApplicantSelectionNavParams({
            applicant: applicant,
            applicantIndex: index,
            updateApplicantCallback: this.tagsUpdateApplicant,
            item: this.item,
            userStarred: this.isApplicantStarred(applicant)
        });

        this.navController.navigateForward('/applicant-selection');
    }

    hasApplicants(): boolean {
        return !Comparator.isEmpty(this.applicants);
    }

    goToCandidates() {
        if (!Comparator.isEmpty(this.item)) {
            this.navController.navigateRoot('/candidates');
        }
    }

    private explainReschedule(applicant: Applicant) {
        if (Comparator.isEmpty(applicant) || !this.isStatusToReschedule(applicant)) {
            return;
        }

        this.storageService.retrieveRescheduleInfoWasSeenOnce().then(async (seen: boolean) => {
            if (!seen) {
                const title: string = this.translateService.instant('APPLICANTS.RESCHEDULE_INFO', {who: Comparator.isEmpty(applicant.user) || Comparator.isEmpty(applicant.user.facebook) ? '' : applicant.user.facebook.firstName});
                const ok: string = this.translateService.instant('CORE.OK');

                const alert: HTMLIonAlertElement = await this.alertController.create({
                    message: title,
                    buttons: [
                        {
                            text: ok,
                            handler: (data: string) => {
                                this.storageService.saveRescheduleInfoSeenOnce(true).then(() => {
                                    // Do nothing
                                });
                            }
                        }
                    ],
                    backdropDismiss: false
                });

                await alert.present();
            }
        });
    }

}
