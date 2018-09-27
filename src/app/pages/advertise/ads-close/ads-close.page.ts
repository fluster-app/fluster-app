import {Component} from '@angular/core';
import {AlertController, LoadingController, NavController, Platform, ToastController} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {forkJoin} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

// Pages
import {AbstractPage} from '../../abstract-page';

// Model
import {Item} from '../../../services/model/item/item';
import {Applicant} from '../../../services/model/appointment/applicant';

// Utils
import {Comparator} from '../../../services/core/utils/utils';
import {ItemsComparator} from '../../../services/core/utils/items-utils';

// Services
import {AppointmentService} from '../../../services/core/appointment/appointment-service';
import {AdsService} from '../../../services/advertise/ads-service';
import {NotificationWatcherService} from '../../../services/core/notification/notification-watcher-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';

@Component({
    selector: 'app-ads-close',
    styleUrls: ['./ads-close.page.scss'],
    templateUrl: './ads-close.page.html',
})
export class AdsClosePage extends AbstractPage {

    item: Item;

    applicants: Applicant[];
    private pageIndex: number = 0;

    lastPageReached: boolean = false;

    noneOfTheApplicantIcon: string;

    constructor(private platform: Platform,
                private navController: NavController,
                private loadingController: LoadingController,
                private alertController: AlertController,
                private toastController: ToastController,
                private translateService: TranslateService,
                private appointmentService: AppointmentService,
                private adsService: AdsService,
                private notificationWatcherService: NotificationWatcherService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super();

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ADS.ADS_CLOSE);

        this.pageIndex = 0;
        this.lastPageReached = false;

        this.noneOfTheApplicantIcon = this.platform.is('android') ? 'assets/img/ico_contact-md.svg' : 'assets/img/ico_contact-ios.svg';
    }

    ionViewWillEnter() {
        this.item = this.adsService.getSelectedItem();

        this.findApplicants().then(() => {
            // Do nothing;
        });
    }

    private findApplicants(): Promise<{}> {
        return new Promise((resolve) => {
            this.appointmentService.findApplicants(this.item._id, this.item.appointment._id, this.RESOURCES.APPLICANT.STATUS.ACCEPTED, true, this.pageIndex, false, 'selected', null).then((results: Applicant[]) => {
                this.buildApplicantsArray();

                this.applicants = this.applicants.concat(results);

                this.pageIndex += 1;

                if (Comparator.isEmpty(results) || results.length < this.RESOURCES.API.PAGINATION.COMMON) {
                    this.lastPageReached = true;
                }

                resolve();
            }, (errorResponse: HttpErrorResponse) => {
                // Nothing found.
                this.lastPageReached = true;

                this.buildApplicantsArray();

                resolve();
            });
        });
    }

    private buildApplicantsArray() {
        if (this.applicants == null) {
            this.applicants = new Array<Applicant>();
        }
    }

    close() {
        this.navController.navigateBack('/ads-details');
    }

    closeItem(applicant: Applicant) {

        const promises = new Array();
        promises.push(this.translateService.get('ADS_CLOSE.CONFIRM_POPUP.TITLE'));
        promises.push(this.translateService.get('ADS_CLOSE.CONFIRM_POPUP.QUESTION'));
        promises.push(this.translateService.get('CORE.YES'));
        promises.push(this.translateService.get('CORE.NO'));

        forkJoin(promises).subscribe(
            async (data: string[]) => {
                if (!Comparator.isEmpty(data) && data.length === promises.length) {
                    const confirm: HTMLIonAlertElement = await this.alertController.create({
                        header: data[0],
                        message: data[1],
                        buttons: [
                            {
                                text: data[3],
                                handler: () => {
                                    // Do nothing
                                }
                            },
                            {
                                text: data[2],
                                handler: () => {
                                    this.doCloseItem(applicant);
                                }
                            }
                        ]
                    });

                    await confirm.present();
                }
            });
    }

    // Set status of item to close
    private async doCloseItem(applicant: Applicant) {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.ADS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.DELETE);

        const loading: HTMLIonLoadingElement = await this.loadingController.create({});

        loading.present().then(() => {
            const itemId: string = this.item._id;

            const newStatus: string = Comparator.equals(this.item.status, this.RESOURCES.ITEM.STATUS.PUBLISHED) ? this.RESOURCES.ITEM.STATUS.CLOSED : this.RESOURCES.ITEM.STATUS.CANCELLED;

            this.adsService.setStatus(itemId, newStatus).then((updatedItem: Item) => {
                const promises = this.getUpdateApplicantStatusPromises(itemId, applicant);
                promises.push(this.notificationWatcherService.markAllAdvertiseNotificationsRead(true));

                forkJoin(promises).subscribe(
                    (data: any[]) => {
                        this.adsService.reset();

                        loading.dismiss().then(() => {
                            this.navController.navigateRoot('/ads-details');
                        });
                    },
                    (err: any) => {
                        loading.dismiss().then(async () => {
                            await this.errorMsg(this.toastController, this.translateService, 'ERRORS.ADS.CLOSE');
                        });
                    }
                );
            }, (response: HttpErrorResponse) => {
                loading.dismiss().then(async () => {
                    await this.errorMsg(this.toastController, this.translateService, 'ERRORS.ADS.CLOSE');
                });
            });
        });
    }

    private getUpdateApplicantStatusPromises(itemId: string, applicant: Applicant): any {
        const promises = new Array();

        const newStatus: string[] = new Array();
        newStatus.push(this.RESOURCES.APPLICANT.STATUS.NEW);

        promises.push(this.appointmentService.updateApplicantStatus(itemId, null, null, newStatus, this.RESOURCES.APPLICANT.STATUS.CANCELLED));

        const rejectedStatus: string[] = new Array();
        rejectedStatus.push(this.RESOURCES.APPLICANT.STATUS.ACCEPTED);
        rejectedStatus.push(this.RESOURCES.APPLICANT.STATUS.TO_RESCHEDULE);

        if (!Comparator.isEmpty(applicant)) {
            const acceptedStatus: string[] = new Array();
            acceptedStatus.push(this.RESOURCES.APPLICANT.STATUS.ACCEPTED);

            promises.push(this.appointmentService.updateApplicantStatus(itemId, applicant._id, null, acceptedStatus, this.RESOURCES.APPLICANT.STATUS.SELECTED));

            promises.push(this.appointmentService.updateApplicantStatus(itemId, null, applicant._id, rejectedStatus, this.RESOURCES.APPLICANT.STATUS.REJECTED));
        } else {
            promises.push(this.appointmentService.updateApplicantStatus(itemId, null, null, rejectedStatus, this.RESOURCES.APPLICANT.STATUS.REJECTED));
        }

        return promises;
    }

    isItemShare() {
        return ItemsComparator.isItemShare(this.item);
    }

    isItemFlat() {
        return ItemsComparator.isItemFlat(this.item);
    }
}
