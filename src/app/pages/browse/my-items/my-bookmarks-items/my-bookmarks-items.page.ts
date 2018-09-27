import {Component, ViewChild} from '@angular/core';
import {List, ModalController, NavController, Platform, ToastController} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';
import {HttpErrorResponse} from '@angular/common/http';

import {TranslateService} from '@ngx-translate/core';

// Page
import {MyItemsPage, ItemCard} from '../abstract-my-items';

// Model
import {Item} from '../../../../services/model/item/item';

// Utils
import {ItemsComparator} from '../../../../services/core/utils/items-utils';

// Services
import {ItemsService} from '../../../../services/browse/items-service';
import {ItemUsersService} from '../../../../services/browse/item-users-service';
import {Converter} from '../../../../services/core/utils/utils';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {LikeService} from '../../../../services/browse/like-service';
import {NotificationWatcherService} from '../../../../services/core/notification/notification-watcher-service';
import {NavParamsService} from '../../../../services/core/navigation/nav-params-service';
import {Applicant} from '../../../../services/model/appointment/applicant';
import {ItemAppointmentsModal} from '../../../../modals/browse/item-appointments/item-appointments';

@Component({
    selector: 'app-my-bookmarks-items',
    templateUrl: './my-bookmarks-items.page.html',
    styleUrls: ['./my-bookmarks-items.page.scss'],
})
export class MyBookmarksItemsPage extends MyItemsPage {

    @ViewChild('slidingList') slidingList: List;

    constructor(protected navController: NavController,
                protected platform: Platform,
                private modalController: ModalController,
                private toastController: ToastController,
                protected translateService: TranslateService,
                protected itemUsersService: ItemUsersService,
                protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private itemsService: ItemsService,
                private likeService: LikeService,
                protected notificationWatcherService: NotificationWatcherService,
                protected navParamsService: NavParamsService) {
        super(platform, navController, translateService, itemUsersService, googleAnalyticsNativeService, notificationWatcherService, navParamsService);

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ITEMS.MY_BOOKMARKS);
    }

    ionViewWillEnter() {
        super.init();
    }

    protected findMyItems(pageIndex: number): Promise<{}> {
        return this.itemsService.findMyBookmarksItems(this.pageIndex, false);
    }

    protected findItemNotificationRead(items: Item[]): Promise<{}> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    itemEnded(selectedItemCard: ItemCard): boolean {
        return Converter.getDateObj(selectedItemCard.item.end).getTime() < new Date().getTime();
    }

    // Open appointment

    navigateToAppointment(selectedItemCard: ItemCard, index: number) {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MY_BOOKMARKS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.BROWSE.ITEM_APPOINTMENTS);

        this.openAppointment(selectedItemCard, index);
    }

    protected async openAppointment(selectedItemCard: ItemCard, index: number) {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MY_APPOINTMENTS_OR_APPLICANTS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.BROWSE.ITEM_APPOINTMENTS);

        const applicant: Applicant = this.hasApplicant(selectedItemCard.item) ? selectedItemCard.item.appointment.applicant[0] : null;

        const modal: HTMLIonModalElement = await this.modalController.create({
            component: ItemAppointmentsModal,
            componentProps: {
                item: selectedItemCard.item,
                itemUser: selectedItemCard.itemUser,
                bookmarked: true,
                applicant: applicant
            }
        });

        modal.onDidDismiss().then(async (detail: OverlayEventDetail) => {
            if (detail.data) {
                await this.removeItemAndCloseSlidingList(index);
            }
        });

        await modal.present();
    }

    // Remove item from bookmark

    dislike(selectedItemCard: ItemCard, index: number) {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MY_BOOKMARKS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ITEMS.DISLIKE);

        this.likeService.likeDislike(selectedItemCard.item._id, false).then(async () => {
            await this.removeItemAndCloseSlidingList(index);
        }, async (response: HttpErrorResponse) => {
            await this.errorMsg(this.toastController, this.translateService, 'ERRORS.ITEMS.ACTION_ERROR');
        });
    }

    protected removeItemFromListFunction = (): Promise<{}> => {
        return new Promise(async (resolve) => {
            await this.removeItemAndCloseSlidingList(this.lastSelectedIndex);
            resolve();
        });
    }

    private removeItemAndCloseSlidingList(index: number): Promise<void> {
        return new Promise<void>(async (resolve) => {
            this.removeItemFromList(index);

            if (this.slidingList) {
                await this.slidingList.closeSlidingItems();
            }

            resolve();
        });
    }

    protected checkSubscriptionViewApplicants() {
        // Do nothing
    }

    isItemShare(selectedItemCard: ItemCard): boolean {
        return ItemsComparator.isItemShare(selectedItemCard.item);
    }
}
