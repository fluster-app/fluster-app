import { Component } from '@angular/core';
import {NavController, Platform, PopoverController} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';
import {HttpErrorResponse} from '@angular/common/http';

import {forkJoin} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

// Page
import {MyItemsPage} from '../abstract-my-items';

// Modal
import {ProductPickerPopover} from '../../../../modals/core/product-picker/product-picker';

// Model
import {Item} from '../../../../services/model/item/item';

// Utils
import {Comparator} from '../../../../services/core/utils/utils';

// Services
import {ItemsService} from '../../../../services/browse/items-service';
import {ItemUsersService} from '../../../../services/browse/item-users-service';
import {NotificationWatcherService} from '../../../../services/core/notification/notification-watcher-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {SubscriptionService} from '../../../../services/core/user/subscription-service';
import {NotificationService} from '../../../../services/core/notification/notification-service';
import {NavParamsService} from '../../../../services/core/navigation/nav-params-service';

export interface ItemRead {
    itemId: string;
    hasUnreadNotifications: boolean;
}

@Component({
  selector: 'app-my-applicants',
  templateUrl: './my-applicants.page.html',
  styleUrls: ['./my-applicants.page.scss'],
})
export class MyApplicantsPage extends MyItemsPage {

    couldViewApplicants: boolean = true;

    constructor(protected navController: NavController,
                protected platform: Platform,
                private popoverController: PopoverController,
                protected translateService: TranslateService,
                protected itemUsersService: ItemUsersService,
                private itemsService: ItemsService,
                protected googleAnalyticsService: GoogleAnalyticsNativeService,
                protected notificationWatcherService: NotificationWatcherService,
                private subscriptionService: SubscriptionService,
                private notificationService: NotificationService,
                protected navParamsService: NavParamsService) {
        super(platform, navController, translateService, itemUsersService, googleAnalyticsService, notificationWatcherService, navParamsService);

        this.gaTrackView(this.platform, this.googleAnalyticsService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ITEMS.MY_PENDING_REQUESTS);
    }

    ionViewWillEnter() {
        super.init();
    }

    ionViewWillLeave() {
        this.notificationWatcherService.resetBrowseNotifications();
    }

    protected findMyItems(pageIndex: number): Promise<{}> {
        return this.itemsService.findMyAppointmentsItems(this.pageIndex, true);
    }

    protected removeItemFromListFunction = (): Promise<{}> => {
        return new Promise((resolve) => {
            resolve();
        });
    }

    isApplicantStatusNew(item: Item): boolean {
        return this.isApplicantStatus(item, this.RESOURCES.APPLICANT.STATUS.NEW);
    }

    isApplicantStatusCancelled(item: Item): boolean {
        return this.isApplicantStatus(item, this.RESOURCES.APPLICANT.STATUS.CANCELLED);
    }

    isApplicantStatusRejected(item: Item): boolean {
        return this.isApplicantStatus(item, this.RESOURCES.APPLICANT.STATUS.REJECTED);
    }

    protected async checkSubscriptionViewApplicants() {
        if (!this.subscriptionService.couldViewApplicants()) {
            const modal: HTMLIonPopoverElement = await this.getProductModal();

            modal.onDidDismiss().then((detail: OverlayEventDetail) => {
                if (detail && !detail.data) {
                    this.itemCards = new Array();
                    this.lastPageReached = true;
                    this.couldViewApplicants = false;
                }
            });

            await modal.present();
        }
    }

    private async getProductModal(): Promise<HTMLIonPopoverElement> {
        return await this.popoverController.create({
            component: ProductPickerPopover,
            componentProps: {
                adDisplay: this.isAdDisplay
            },
            cssClass: 'product-modal',
            backdropDismiss: false
        });
    }

    private isApplicantStatusNewRead(item: Item): Promise<ItemRead> {
        return new Promise((resolve) => {

            if (!this.isApplicantStatusNew(item)) {
                resolve({itemId: item._id, hasUnreadNotifications: false});
            } else {
                this.notificationService.hasApplicantUnreadNotifications(item._id, item.appointment._id, item.appointment.applicant[0]._id, item.user._id).then((result: boolean) => {
                    resolve({itemId: item._id, hasUnreadNotifications: result});
                }, (errorResponse: HttpErrorResponse) => {
                    resolve({itemId: item._id, hasUnreadNotifications: false});
                });
            }
        });
    }

    protected findItemNotificationRead(items: Item[]): Promise<{}> {
        return new Promise((resolve) => {

            if (Comparator.isEmpty(this.itemCards) || Comparator.isEmpty(items)) {
                resolve();
            } else {
                const promises = new Array();

                for (let i = 0; i < items.length; i++) {
                    promises.push(this.isApplicantStatusNewRead(items[i]));
                }

                forkJoin(promises).subscribe(
                    (data: ItemRead[]) => {
                        if (!Comparator.isEmpty(data)) {
                            for (let i = 0; i < data.length; i++) {
                                this.findCardIndex(data[i].itemId).then((index: number) => {
                                    if (index != null) {
                                        this.itemCards[index].itemNotificationUnread = data[i].hasUnreadNotifications;
                                    }
                                });
                            }
                        }

                        resolve();
                    });
            }
        });
    }
}
