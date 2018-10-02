import {Component} from '@angular/core';
import {LoadingController, MenuController, NavController, Platform, ToastController} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {forkJoin} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {SplashScreen} from '@ionic-native/splash-screen/ngx';

// Model
import {Applicant} from '../../../../services/model/appointment/applicant';
import {Item} from '../../../../services/model/item/item';

// Services
import {AppointmentService} from '../../../../services/core/appointment/appointment-service';

// Pages
import {AbstractAdsPage} from '../abstract-ads';

// Resources and utils
import {Comparator} from '../../../../services/core/utils/utils';

// Services
import {AdsService} from '../../../../services/advertise/ads-service';
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {LoginService} from '../../../../services/core/login/login-service';
import {LocalFilesService} from '../../../../services/native/localfiles/local-files-service';
import {ItemsComparator} from '../../../../services/core/utils/items-utils';
import {StorageService} from '../../../../services/core/localstorage/storage-service';
import {NotificationWatcherService} from '../../../../services/core/notification/notification-watcher-service';
import {CandidatesService} from '../../../../services/advertise/candidates-service';
import {NavParamsService} from '../../../../services/core/navigation/nav-params-service';

@Component({
    selector: 'app-ads-next-appointments',
    templateUrl: './ads-next-appointments.page.html',
    styleUrls: ['./ads-next-appointments.page.scss'],
})
export class AdsNextAppointmentsPage extends AbstractAdsPage {

    applicants: Applicant[];

    totalNewAdvertiseNotifications: number;

    private pageIndex: number = 0;
    private lastPageReached: boolean = false;

    displayExpirationMsg: boolean = false;
    fadeExpirationMsg: boolean = false;
    isItemAlreadyExpired: boolean = false;

    constructor(protected platform: Platform,
                protected navController: NavController,
                protected loadingController: LoadingController,
                private menuController: MenuController,
                protected toastController: ToastController,
                private splashScreen: SplashScreen,
                protected translateService: TranslateService,
                private appointmentService: AppointmentService,
                protected adsService: AdsService,
                protected newItemService: NewItemService,
                protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private loginService: LoginService,
                protected localFilesService: LocalFilesService,
                private storageService: StorageService,
                private notificationWatcherService: NotificationWatcherService,
                protected candidatesService: CandidatesService,
                protected navParamsService: NavParamsService) {
        super(platform, loadingController, navController, toastController, translateService, googleAnalyticsNativeService, adsService, newItemService, localFilesService, candidatesService, navParamsService);

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ADS.ADS_NEXT_APPOINTMENTS);

        this.pageIndex = 0;
        this.lastPageReached = false;
    }

    async ionViewWillEnter() {
        this.initAdsItems();

        this.hideSplashScreen(this.platform, this.splashScreen, this.loginService);

        await this.enableMenu(this.menuController, false, true);
    }

    ionViewWillLeave() {
        this.notificationWatcherService.resetAdvertiseNotifications();
    }

    private initAdsItems() {
        if (!Comparator.isEmpty(this.adsService.getSelectedItem())) {
            this.item = this.adsService.getSelectedItem();
            this.adsService.setSelectedItem(this.item);

            this.initApplicants().then(() => {
                // Do nothing;
            });
        } else {
            this.adsService.findAdsItems().then((items: Item[]) => {
                this.item = Comparator.isEmpty(items) ? null : items[0];
                this.adsService.setSelectedItem(this.item);

                if (this.item == null) {
                    this.constructApplicants();
                } else {
                    this.initApplicants().then(() => {
                        // Do nothing;
                    });

                    this.itemExpiringMsg();
                }
            }, (errorResponse: HttpErrorResponse) => {
                this.item = null;
                this.adsService.setSelectedItem(this.item);
                this.constructApplicants();
            });
        }

    }

    findNextApplicants(event) {
        this.findApplicants().then(() => {
            event.target.complete();
        });
    }

    private constructApplicants() {
        if (this.applicants == null) {
            this.applicants = new Array<Applicant>();
        }
    }

    private initApplicants(): Promise<{}> {

        return new Promise((resolve) => {

            const promises = new Array();

            promises.push(this.findApplicants());
            promises.push(this.countPendingApplicants());
            promises.push(this.findStarredCandidates());

            forkJoin(promises).subscribe(
                () => {
                    resolve();
                },
                (err: any) => {
                    resolve();
                }
            );
        });
    }

    private findApplicants(): Promise<{}> {
        // Load applicants to retrieve next appointments
        return new Promise((resolve) => {
            this.appointmentService.findApplicants(this.item._id, this.item.appointment._id, this.RESOURCES.APPLICANT.STATUS.ACCEPTED, true, this.pageIndex, true, 'selected', null).then((results: Applicant[]) => {
                this.constructApplicants();

                this.applicants = this.applicants.concat(results);

                this.pageIndex += 1;

                if (Comparator.isEmpty(results) || results.length < this.RESOURCES.API.PAGINATION.COMMON) {
                    this.lastPageReached = true;
                }

                resolve();
            }, (errorResponse: HttpErrorResponse) => {
                // Nothing found.
                this.lastPageReached = true;

                this.constructApplicants();

                resolve();
            });
        });
    }

    private countPendingApplicants(): Promise<{}> {
        return new Promise((resolve) => {
            this.appointmentService.findApplicants(this.item._id, this.item.appointment._id, this.RESOURCES.APPLICANT.STATUS.NEW, false, 0, false, 'selected', null).then((results: Applicant[]) => {
                this.totalNewAdvertiseNotifications = Comparator.isEmpty(results) ? 0 : results.length;
            }, (errorResponse: HttpErrorResponse) => {
                this.totalNewAdvertiseNotifications = 0;
            });
        });
    }

    isLastPageReached(): boolean {
        return this.lastPageReached;
    }

    isApplicantsLoaded(): boolean {
        return this.applicants != null;
    }

    hasApplicants(): boolean {
        return !Comparator.isEmpty(this.applicants);
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

    private itemExpiringMsg() {
        if (ItemsComparator.isItemExpiringSoon(this.item)) {

            this.isItemAlreadyExpired = ItemsComparator.isItemExpired(this.item);

            this.storageService.retrieveWarningAdsExpiredWasSeenOnce().then((warningSeenOnce: boolean) => {
                if (warningSeenOnce == null || !warningSeenOnce) {
                    this.displayExpirationMsg = true;

                    setTimeout(() => {
                        this.fadeExpirationMsg = true;

                        setTimeout(() => {
                            this.displayExpirationMsg = false;
                        }, this.RESOURCES.TIME_OUT.NOTIFICATION.FADE_OUT);
                    }, this.RESOURCES.TIME_OUT.NOTIFICATION.DISPLAY);

                    this.storageService.saveWarningAdsExpiredWasSeenOnce(true).then(() => {
                        // Do nothing
                    });
                }
            });
        }
    }

    closeExpirationMsg() {
        this.displayExpirationMsg = false;
    }

    goToApplicants() {
        this.navController.navigateRoot('/applicants');
    }

    goToCandidates() {
        this.navController.navigateRoot('/candidates');
    }

}
