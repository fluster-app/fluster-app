import {NavController, Platform} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {TranslateService} from '@ngx-translate/core';

// Page
import {AbstractPage} from '../../abstract-page';

// Model
import {Item} from '../../../services/model/item/item';
import {ItemUser} from '../../../services/model/item/item-user';

// Resources and utils
import {Comparator} from '../../../services/core/utils/utils';
import {ItemsComparator} from '../../../services/core/utils/items-utils';
import {ApplicantsComparator} from '../../../services/core/utils/applicant-utils';

// Services
import {ItemUsersService} from '../../../services/browse/item-users-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {NotificationWatcherService} from '../../../services/core/notification/notification-watcher-service';
import {NavParamsService} from '../../../services/core/navigation/nav-params-service';

export interface ItemCard {
    item: Item;
    itemUser: ItemUser;
    itemNotificationUnread: boolean;
}

export abstract class MyItemsPage extends AbstractPage {

    protected abstract removeItemFromListFunction;

    itemCards: ItemCard[];

    protected pageIndex: number = 0;
    protected lastPageReached: boolean = false;

    protected lastSelectedIndex: number;

    loaded: boolean = false;

    constructor(protected platform: Platform,
                protected navController: NavController,
                protected translateService: TranslateService,
                protected itemUsersService: ItemUsersService,
                protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                protected notificationWatcherService: NotificationWatcherService,
                protected navParamsService: NavParamsService) {
        super();
    }

    init() {
        this.initItems();
    }

    // Find items

    initItems() {
        this.itemCards = null;

        this.pageIndex = 0;
        this.lastPageReached = false;

        this.findItems().then((results: Item[]) => {
            this.findItemUsers(results).then(() => {
                this.findItemNotificationRead(results).then(() => {
                    // Do nothing;
                });
            });
        });
    }

    findNextItems(event) {
        this.findItems().then((results: Item[]) => {
            this.findItemUsers(results).then(() => {
                this.findItemNotificationRead(results).then(() => {
                    // Do nothing;
                });
            });
            event.target.complete();
        });
    }

    protected abstract findMyItems(pageIndex: number): Promise<{}>;

    protected abstract findItemNotificationRead(items: Item[]): Promise<{}>;

    protected abstract checkSubscriptionViewApplicants();

    protected findItems(): Promise<{}> {
        return new Promise((resolve) => {
            this.findMyItems(this.pageIndex).then((results: Item[]) => {
                if (Comparator.isEmpty(this.itemCards)) {
                    this.itemCards = new Array();
                }

                if (!Comparator.isEmpty(results)) {
                    for (let i = 0; i < results.length; i++) {
                        this.itemCards.push({
                            item: results[i],
                            itemUser: null,
                            itemNotificationUnread: true
                        });
                    }
                }

                if (!Comparator.isEmpty(results) && this.pageIndex === 0) {
                    this.checkSubscriptionViewApplicants();
                }

                this.pageIndex += 1;

                if (Comparator.isEmpty(results) || results.length < this.RESOURCES.API.PAGINATION.COMMON) {
                    this.lastPageReached = true;
                }

                this.loaded = true;

                resolve(results);
            }, (errorResponse: HttpErrorResponse) => {
                // Nothing found.
                this.lastPageReached = true;
                this.itemCards = new Array();
                this.loaded = true;

                resolve(null);
            });
        });
    }

    protected findItemUsers(items: Item[]): Promise<{}> {
        return new Promise((resolve) => {
            if (Comparator.isEmpty(items)) {
                resolve();
            } else {
                this.itemUsersService.findItemUsers(items).then((results: ItemUser[]) => {
                    if (!Comparator.isEmpty(this.itemCards) && !Comparator.isEmpty(results)) {
                        for (let i = 0; i < results.length; i++) {
                            // ItemUser isn't populated here, therefore item object is the id
                            this.findCardIndex(<any> results[i].item).then((index: number) => {
                                if (index != null) {
                                    this.itemCards[index].itemUser = results[i];
                                }
                            });

                            resolve();
                        }
                    } else {
                        resolve();
                    }
                }, (err: HttpErrorResponse) => {
                    // Nothing, we ignore the error
                    resolve();
                });
            }
        });
    }

    protected findCardIndex(itemId: string): Promise<{}> {
        return new Promise((resolve) => {
            let index: number = null;

            for (let i = 0; i < this.itemCards.length; i++) {
                if (Comparator.equals(this.itemCards[i].item._id, itemId)) {
                    index = i;
                }
            }

            resolve(index);
        });
    }

    isLastPageReached(): boolean {
        return this.lastPageReached;
    }

    // Appointment and applicant

    // If applicant array not empty, it contains here only the current user application
    hasApplicant(item: Item): boolean {
        return !Comparator.isEmpty(item.appointment) && Comparator.hasElements(item.appointment.applicant);
    }

    navigateToDetail(selectedItemCard: ItemCard, index: number, backUrl: string) {
        this.lastSelectedIndex = index;

        this.goToDetail(selectedItemCard.item, selectedItemCard.itemUser, backUrl);
    }

    // Navigate

    private goToDetail(selectedItem: Item, selectedItemUser: ItemUser, backUrl: string) {
        this.navParamsService.setItemDetailsNavParams({
            item: selectedItem,
            itemUser: selectedItemUser,
            bookmarked: true,
            applicant: this.hasApplicant(selectedItem) ? selectedItem.appointment.applicant[0] : null,
            callback: this.removeItemFromListFunction,
            backUrl: backUrl
        });

        this.navController.navigateForward('/item-details');
    }

    hasItems(): boolean {
        return !Comparator.isEmpty(this.itemCards);
    }

    itemStillAvalaible(item: Item): boolean {
        return Comparator.equals(item.status, this.RESOURCES.ITEM.STATUS.PUBLISHED);
    }

    isApplicantStatusAccepted(item: Item): boolean {
        return this.isApplicantStatus(item, this.RESOURCES.APPLICANT.STATUS.ACCEPTED);
    }

    isApplicantStatusToReschedule(item: Item): boolean {
        return this.isApplicantStatus(item, this.RESOURCES.APPLICANT.STATUS.TO_RESCHEDULE);
    }

    isApplicantStatusSelected(item: Item): boolean {
        return this.isApplicantStatus(item, this.RESOURCES.APPLICANT.STATUS.SELECTED);
    }

    protected isApplicantStatus(item: Item, status: string): boolean {
        return !Comparator.isEmpty(item.appointment) && !Comparator.isEmpty(item.appointment.applicant) && item.appointment.applicant[0].status == status;
    }

    protected removeItemFromList(index: number) {
        if (Comparator.hasElements(this.itemCards) && index != null && this.itemCards.length > index) {
            this.itemCards.splice(index, 1);
        }
    }

    isItemStarred(selectedItemCard: ItemCard): boolean {
        return ItemsComparator.isItemStarred(selectedItemCard.item);
    }

    navigateCard(selectedItemCard: ItemCard, backUrl: string) {
        this.notificationWatcherService.resetBrowseNotifications();

        if (this.hasApplicant(selectedItemCard.item) && ApplicantsComparator.couldChat(selectedItemCard.item.appointment.applicant[0])) {
            this.navigateToChat(selectedItemCard);
        } else {
            // index null, we don't want to remove it later if a request is send
            this.navigateToDetail(selectedItemCard, null, backUrl);
        }
    }

    private navigateToChat(selectedItemCard: ItemCard) {
        this.navParamsService.setChatNavParams({
            applicant: this.hasApplicant(selectedItemCard.item) ? selectedItemCard.item.appointment.applicant[0] : null,
            item: selectedItemCard.item,
            itemUser: selectedItemCard.itemUser,
            userStarred: this.isItemStarred(selectedItemCard)
        });

        this.navController.navigateForward('/chat');
    }

}
