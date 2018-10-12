import {Component, ElementRef, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {
    ActionSheetController, AlertController,
    LoadingController, MenuController,
    ModalController,
    NavController,
    Platform, PopoverController,
    ToastController
} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';
import {HttpErrorResponse} from '@angular/common/http';

import {forkJoin} from 'rxjs';

import {Card} from 'ionic-swing';

import {SocialSharing} from '@ionic-native/social-sharing/ngx';

import {TranslateService} from '@ngx-translate/core';

// Page
import {AbstractItemsPage} from '../abstract-items';

// Modal
import {ItemAppointmentsModal} from '../../../../modals/browse/item-appointments/item-appointments';

// Model
import {Item} from '../../../../services/model/item/item';
import {ItemUser} from '../../../../services/model/item/item-user';
import {User} from '../../../../services/model/user/user';
import {Applicant} from '../../../../services/model/appointment/applicant';

// Utils
import {Comparator, Converter} from '../../../../services/core/utils/utils';
import {ApplicantsComparator} from '../../../../services/core/utils/applicant-utils';

// Services
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {UserSessionService} from '../../../../services/core/user/user-session-service';
import {LikeService} from '../../../../services/browse/like-service';
import {LastItemsService} from '../../../../services/browse/last-items-service';
import {ComplaintService} from '../../../../services/core/complaint/complaint-service';
import {ItemUsersService} from '../../../../services/browse/item-users-service';
import {CurrencyService} from '../../../../services/core/currency/currency-service';
import {SubscriptionService} from '../../../../services/core/user/subscription-service';
import {ItemDetailsNavParams, NavParamsService} from '../../../../services/core/navigation/nav-params-service';

@Component({
    selector: 'app-item-details',
    styleUrls: ['./item-details.page.scss'],
    templateUrl: './item-details.page.html'
})
export class ItemDetailsPage extends AbstractItemsPage {

    @ViewChild('itemDetailsHeaderToolbar', {read: ElementRef}) detailsHeaderToolbar: ElementRef;

    item: Item;
    itemUser: ItemUser;
    itemSwingCard: Card;

    user: User;

    applicant: Applicant;

    alreadyBookmarked: boolean = false;
    alreadyDisliked: boolean = false;
    displaySensitive: boolean = false;
    private couldChat: boolean = false;

    srcDeeplink: boolean = false;

    displayButtons: boolean = false;

    hideChat: boolean = true;

    callback: any;

    // If user don't wait and click fast on back button while we are working
    actionInProgress: boolean = false;

    constructor(private platform: Platform,
                private navController: NavController,
                private modalController: ModalController,
                protected popoverController: PopoverController,
                private toastController: ToastController,
                private actionSheetController: ActionSheetController,
                private alertController: AlertController,
                private loadingController: LoadingController,
                private menuController: MenuController,
                private location: Location,
                private socialSharing: SocialSharing,
                private translateService: TranslateService,
                private userSessionService: UserSessionService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private likeService: LikeService,
                private lastItemsService: LastItemsService,
                private complaintService: ComplaintService,
                protected itemUsersService: ItemUsersService,
                private currencyService: CurrencyService,
                private subscriptionService: SubscriptionService,
                private navParamsService: NavParamsService) {
        super(popoverController, itemUsersService);

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ITEMS.ITEM_DETAILS);
    }

    ionViewWillEnter() {
        this.user = this.userSessionService.getUser();

        this.initItem();
    }

    async ionViewDidEnter() {
        try {
            const itemDetailsNavParams: ItemDetailsNavParams = await this.navParamsService.getItemDetailsNavParams();
            const deeplink: boolean = itemDetailsNavParams.deeplink;
            if (deeplink != null && deeplink) {
                await this.enableMenu(this.menuController, true, false);
                this.srcDeeplink = true;
            }

            this.displayButtons = true;
        } catch (err) {
            // Do nothing
        }
    }

    async customBackAction() {
        if (!this.actionInProgress) {
            try {
                // Tricks, we don't want effect on go back to chat
                const itemDetailsNavParams: ItemDetailsNavParams = await this.navParamsService.getItemDetailsNavParams();
                const withAnimation: boolean = !this.isParamsHideChat(itemDetailsNavParams);

                await this.navController.navigateBack(itemDetailsNavParams.backUrl, withAnimation);
            } catch (err) {
                // Do nothing
            }
        }
    }

    private async initItem() {
        try {
            const itemDetailsNavParams: ItemDetailsNavParams = await this.navParamsService.getItemDetailsNavParams();

            this.item = itemDetailsNavParams.item;
            this.itemUser = itemDetailsNavParams.itemUser;
            this.itemSwingCard = itemDetailsNavParams.itemSwingCard;

            const bookmarked: boolean = itemDetailsNavParams.bookmarked;
            this.alreadyBookmarked = bookmarked != null && bookmarked;

            const disliked: boolean = itemDetailsNavParams.disliked;
            this.alreadyDisliked = disliked != null && disliked;

            this.applicant = itemDetailsNavParams.applicant;

            this.displaySensitive = ApplicantsComparator.isAccepted(this.applicant);
            this.couldChat = ApplicantsComparator.couldChat(this.applicant);

            this.hideChat = this.isParamsHideChat(itemDetailsNavParams);

            this.callback = itemDetailsNavParams.callback;
        } catch (err) {
            // Do nothing
        }
    }

    private isParamsHideChat(itemDetailsNavParams: ItemDetailsNavParams): boolean {
        const displayChat: boolean = itemDetailsNavParams.displayChat;
        return displayChat != null && !displayChat;
    }

    dislike() {
        this.actionInProgress = true;

        this.likeDislike(false);
    }

    like() {
        this.subscriptionService.couldAddLike().then((result: boolean) => {
            if (result) {
                this.doLike();
            } else {
                this.showProductModal(this.doLikeCallback);
            }
        });
    }

    private doLikeCallback = () => {
        this.doLike();
    }

    private doLike() {
        this.actionInProgress = true;

        this.likeDislike(true);
    }

    private likeDislike(like: boolean) {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ITEMS, like ? this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ITEMS.LIKE : this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ITEMS.DISLIKE);

        if (!like) {
            this.lastItemsService.countDisliked++;
        }

        this.likeService.likeDislike(this.item._id, like).then(async () => {
            if (like) {
                this.saveInterests(this.itemUser).then(async () => {
                    await this.removeItemAndNavigate(true);
                });
            } else {
                await this.removeItemAndNavigate(true);
            }
        }, async (response: HttpErrorResponse) => {
            await this.errorMsg(this.toastController, this.translateService, 'ERRORS.ITEMS.ACTION_ERROR');
            this.actionJobIsDone();
        });
    }

    async navigateToAppointment() {
        const modal: HTMLIonModalElement = await this.modalController.create({
            component: ItemAppointmentsModal,
            componentProps: {
                item: this.item,
                itemUser: this.itemUser,
                itemSwingCard: this.itemSwingCard,
                bookmarked: this.alreadyBookmarked,
                applicant: this.applicant
            }
        });

        modal.onDidDismiss().then(async (detail: OverlayEventDetail) => {
            if (detail !== null && detail.data) {
                // Item was already removed in modal
                await this.removeItemAndNavigate(false);
            }
        });

        await modal.present();
    }

    private async removeItemAndNavigate(removeItem: boolean) {
        const itemDetailsNavParams: ItemDetailsNavParams = await this.navParamsService.getItemDetailsNavParams();
        const backUrl: string = itemDetailsNavParams && itemDetailsNavParams.backUrl ? itemDetailsNavParams.backUrl : '/items';

        if (this.srcDeeplink) {
            this.lastItemsService.reset();

            this.navController.navigateRoot(backUrl).then(() => {
                this.actionJobIsDone();
            });
        } else {
            if (removeItem) {
                if (this.itemSwingCard) {
                    this.itemSwingCard.destroy();
                }

                this.lastItemsService.removeItem();
            }

            if (this.callback != null) {
                this.callback().then(() => {
                    this.navController.navigateBack(backUrl).then(() => {
                        this.actionJobIsDone();
                    });
                });
            } else {
                this.navController.navigateBack(backUrl).then(() => {
                    this.actionJobIsDone();
                });
            }
        }
    }

    presentActionSheet(ev) {

        const promises = new Array();
        promises.push(this.translateService.get('ITEM_DETAILS.POPOVER.VIEWING'));
        promises.push(this.translateService.get('ITEM_DETAILS.POPOVER.BOOKMARK'));
        promises.push(this.translateService.get('ITEM_DETAILS.POPOVER.DISLIKE'));
        promises.push(this.translateService.get('ITEM_DETAILS.POPOVER.COMPLAIN'));
        promises.push(this.translateService.get('ITEM_DETAILS.POPOVER.SHARE'));
        promises.push(this.translateService.get('CORE.CANCEL'));

        forkJoin(promises).subscribe(
            async (data: string[]) => {
                if (!Comparator.isEmpty(data) && data.length === promises.length) {
                    const buttons = new Array();

                    if (this.isAppointmentActionAllowed()) {
                        buttons.push({
                            text: data[0],
                            role: 'destructive',
                            handler: () => {
                                this.navigateToAppointment();
                            }
                        });

                        if (!this.alreadyBookmarked) {
                            buttons.push({
                                text: data[1],
                                handler: () => {
                                    this.like();
                                }
                            });
                        }
                    }

                    if ((this.isItemPublished() || this.isItemClosed()) && !this.couldChat && !this.isSameUser() && !this.alreadyDisliked && Comparator.isEmpty(this.applicant)) {
                        buttons.push({
                            text: data[2],
                            handler: () => {
                                this.dislike();
                            }
                        });
                    }

                    buttons.push({
                        text: data[3],
                        handler: () => {
                            this.presentComplaints();
                        }
                    });

                    buttons.push({
                        text: data[4],
                        handler: () => {
                            this.shareItemDetail();
                        }
                    });

                    buttons.push({
                        text: data[5],
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

    isItemPublished(): boolean {
        return this.item != null && Comparator.equals(this.item.status, this.RESOURCES.ITEM.STATUS.PUBLISHED);
    }

    isAppointmentActionAllowed(): boolean {
        return this.isItemPublished() &&
            !this.couldChat && !this.isSameUser()
            && Converter.getDateObj(this.item.end).getTime() >= new Date().getTime()
            && Comparator.isEmpty(this.applicant);
    }

    private isItemClosed(): boolean {
        return this.item != null && Comparator.equals(this.item.status, this.RESOURCES.ITEM.STATUS.CLOSED);
    }

    private shareItemDetail() {
        this.shareItem(this.platform, this.socialSharing, this.googleAnalyticsNativeService, this.loadingController, this.translateService, this.currencyService, this.item).then(() => {
            // Do nothing
        }, (err: any) => {
            // Do nothing
        });
    }

    private presentComplaints() {
        const promises = new Array();
        promises.push(this.translateService.get('COMPLAINT.TITLE'));
        promises.push(this.translateService.get('COMPLAINT.INAPPROPRIATE'));
        promises.push(this.translateService.get('COMPLAINT.FAKE'));
        promises.push(this.translateService.get('CORE.CANCEL'));
        promises.push(this.translateService.get('CORE.OK'));

        forkJoin(promises).subscribe(
            async (data: string[]) => {
                if (!Comparator.isEmpty(data) && data.length === promises.length) {
                    const alert: HTMLIonAlertElement = await this.alertController.create({
                        header: data[0],
                        inputs: [
                            {
                                name: 'inappropriate',
                                type: 'radio',
                                label: data[1],
                                value: this.RESOURCES.COMPLAINT.INAPPROPRIATE,
                                checked: true
                            },
                            {
                                name: 'fake',
                                type: 'radio',
                                label: data[2],
                                value: this.RESOURCES.COMPLAINT.FAKE,
                                checked: false
                            }
                        ],
                        buttons: [
                            {
                                text: data[3],
                                role: 'cancel'
                            },
                            {
                                text: data[4],
                                handler: (choice: string) => {
                                    this.createComplaint(choice);
                                }
                            }
                        ]
                    });

                    alert.present();
                }
            }
        );
    }

    private createComplaint(reason: string) {
        this.complaintService.itemComplaint(this.item, reason).then((result: boolean) => {
            // Do nothing
        }, async (response: HttpErrorResponse) => {
            await this.errorMsg(this.toastController, this.translateService, 'ERRORS.ITEM_DETAILS.COMPLAINT');
        });
    }

    isSameUser(): boolean {
        return !Comparator.isEmpty(this.user) && !Comparator.isEmpty(this.item) && !Comparator.isEmpty(this.item.user) && Comparator.equals(this.user._id, this.item.user._id);
    }

    private actionJobIsDone() {
        this.actionInProgress = false;
    }

}
