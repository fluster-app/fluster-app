import {Component, ElementRef, ViewChild} from '@angular/core';
import {
    ActionSheetController,
    LoadingController,
    MenuController,
    NavController,
    Platform,
    ToastController
} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {forkJoin} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {SocialSharing} from '@ionic-native/social-sharing/ngx';

// Pages
import {AbstractAdsPage} from '../abstract-ads';

// Model
import {Item} from '../../../../services/model/item/item';

// Resources and utils
import {Comparator} from '../../../../services/core/utils/utils';

// Services
import {AdsService} from '../../../../services/advertise/ads-service';
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {LocalFilesService} from '../../../../services/native/localfiles/local-files-service';
import {CurrencyService} from '../../../../services/core/currency/currency-service';
import {NotificationWatcherService} from '../../../../services/core/notification/notification-watcher-service';
import {CandidatesService} from '../../../../services/advertise/candidates-service';
import {NavParamsService} from '../../../../services/core/navigation/nav-params-service';

@Component({
    selector: 'app-ads-details',
    styleUrls: ['./ads-details.page.scss'],
    templateUrl: './ads-details.page.html'
})
export class AdsDetailsPage extends AbstractAdsPage {

    @ViewChild('adsDetailsHeaderToolbar', {read: ElementRef}) detailsHeaderToolbar: ElementRef;

    item: Item;

    loaded: boolean = false;

    constructor(protected platform: Platform,
                protected navController: NavController,
                private menuController: MenuController,
                protected loadingController: LoadingController,
                protected toastController: ToastController,
                protected translateService: TranslateService,
                private socialSharing: SocialSharing,
                protected adsService: AdsService,
                protected newItemService: NewItemService,
                protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                protected localFilesService: LocalFilesService,
                private actionSheetController: ActionSheetController,
                private currencyService: CurrencyService,
                private notificationWatcherService: NotificationWatcherService,
                protected navParamsService: NavParamsService,
                protected candidatesService: CandidatesService) {
        super(platform, loadingController, navController, toastController, translateService, googleAnalyticsNativeService, adsService, newItemService, localFilesService, candidatesService, navParamsService);

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ADS.ADS_DETAILS);
    }

    async ionViewWillEnter() {
        await this.enableMenu(this.menuController, false, true);

        // Default is /ads-details
        this.navParamsService.setAdminAdsNavParams(null);

        this.initAdsItems();
    }

    ionViewWillLeave() {
        this.notificationWatcherService.resetAdvertiseNotifications();
    }

    private initAdsItems() {
        if (!Comparator.isEmpty(this.adsService.getSelectedItem())) {
            this.item = this.adsService.getSelectedItem();
            this.loaded = true;
        } else {
            this.adsService.findAdsItems().then((items: Item[]) => {
                this.item = Comparator.isEmpty(items) ? null : items[0];
                this.adsService.setSelectedItem(this.item);
                this.loaded = true;
            }, (errorResponse: HttpErrorResponse) => {
                this.item = null;
                this.adsService.setSelectedItem(this.item);
                this.loaded = true;
            });
        }
    }

    private edit() {
        this.showPopupPageChange().then((loading: HTMLIonLoadingElement) => {
            this.newItemService.load(this.item, this.item.appointment);

            this.navigateToWizard(loading, '/ads-details');
        });
    }

    private close() {
        this.navController.navigateForward('/ads-close');
    }

    async adminAppointments() {
        await this.navController.navigateForward('/admin-appointments');
    }

    presentActionSheet(ev) {

        const promises = new Array();
        promises.push(this.translateService.get('ADS.ACTIONS.EDIT_APPOINTMENTS'));
        promises.push(this.translateService.get('ADS.ACTIONS.EDIT_ADS'));
        promises.push(this.translateService.get('ADS.ACTIONS.CLOSE'));
        promises.push(this.translateService.get('ITEM_DETAILS.POPOVER.SHARE'));
        promises.push(this.translateService.get('CORE.CANCEL'));
        promises.push(this.translateService.get('ADS.ACTIONS.LIMIT_ADS'));

        forkJoin(promises).subscribe(
            async (data: string[]) => {
                if (!Comparator.isEmpty(data) && data.length === promises.length) {
                    const buttons = new Array();

                    buttons.push({
                        text: data[0],
                        role: 'destructive',
                        handler: async () => {
                            await this.adminAppointments();
                        }
                    });

                    buttons.push({
                        text: data[5],
                        handler: async () => {
                            await this.navigateToAdminLimitation();
                        }
                    });

                    buttons.push({
                        text: data[1],
                        handler: () => {
                            this.edit();
                        }
                    });

                    buttons.push({
                        text: data[2],
                        handler: () => {
                            this.close();
                        }
                    });

                    buttons.push({
                        text: data[3],
                        handler: () => {
                            this.shareAd();
                        }
                    });

                    buttons.push({
                        text: data[4],
                        role: 'cancel',
                        handler: () => {
                            // Do nothing
                        }
                    });


                    const actionSheet: HTMLIonActionSheetElement = await this.actionSheetController.create({
                        buttons: buttons
                    });

                    actionSheet.present().then(() => {
                        // Nothing to do on close
                    });
                }
            }
        );
    }

    shareAd() {
        this.shareItem(this.platform, this.socialSharing, this.googleAnalyticsNativeService, this.loadingController, this.translateService, this.currencyService, this.item).then(() => {
            // Do nothing
        }, (err: any) => {
            // Do nothing
        });
    }

    categoryChange(category: string) {
    }
}
