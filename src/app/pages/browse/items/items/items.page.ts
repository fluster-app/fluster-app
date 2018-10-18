import {Component, NgZone, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {
    AlertController,
    Datetime,
    LoadingController,
    MenuController,
    ModalController,
    NavController,
    Platform, PopoverController,
    ToastController
} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';

import {forkJoin} from 'rxjs';

import {SplashScreen} from '@ionic-native/splash-screen/ngx';

import {StackConfig, DragEvent, SwingStackDirective, SwingCardDirective, Direction} from 'ionic-swing';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

// Page
import {AbstractItemsPage} from '../abstract-items';

// Modal
import {ItemAppointmentsModal} from '../../../../modals/browse/item-appointments/item-appointments';

// Model
import {Item} from '../../../../services/model/item/item';
import {ItemUser, ItemInterest} from '../../../../services/model/item/item-user';
import {User} from '../../../../services/model/user/user';

// Resources and utils
import {Comparator} from '../../../../services/core/utils/utils';
import {ItemsComparator} from '../../../../services/core/utils/items-utils';

// Services
import {LastItemsService} from '../../../../services/browse/last-items-service';
import {LikeService} from '../../../../services/browse/like-service';
import {ItemUsersService} from '../../../../services/browse/item-users-service';
import {ItemsService} from '../../../../services/browse/items-service';
import {UserSessionService} from '../../../../services/core/user/user-session-service';
import {LoginService} from '../../../../services/core/login/login-service';
import {StorageService} from '../../../../services/core/localstorage/storage-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {SubscriptionService} from '../../../../services/core/user/subscription-service';
import {NotificationService} from '../../../../services/core/notification/notification-service';
import {NavParamsService} from '../../../../services/core/navigation/nav-params-service';
import {UserProfileService} from '../../../../services/core/user/user-profile-service';
import {AppRoutingPreloaderService} from '../../../../services/core/routing/app-routing-preloader.service';

@Component({
    selector: 'app-items',
    templateUrl: './items.page.html',
    styleUrls: ['./items.page.scss'],
})
export class ItemsPage extends AbstractItemsPage implements OnInit, OnDestroy {

    @ViewChild('itemsSwingStack', {read: SwingStackDirective}) swingStack: SwingStackDirective;
    @ViewChildren('itemsSwingCards', {read: SwingCardDirective}) swingCards: QueryList<SwingCardDirective>;

    @ViewChild('birthdayPicker', {read: Datetime}) birthdayPicker: Datetime;

    stackConfig: StackConfig;

    user: User;
    items: Item[];

    lastItem: Item;
    lastItemUser: ItemUser;
    lastItemUserLoaded: boolean = false;

    previousItem: Item;

    private pageIndex: number = 0;
    lastPageReached: boolean = false;

    private likeInfoMsg: boolean = false;
    private dislikeInfoMsg: boolean = false;

    private searchDisliked: boolean = false;

    ySwing: number = 0;

    animateDislike: boolean = false;
    animateBookmark: boolean = false;
    animateReview: boolean = false;

    actionInProgress: boolean = false;

    sameUser: boolean = false;

    displayFirstAccessMsg: boolean;
    displayFirstSuperstarMsg: boolean = false;

    birthdayDateFormat: string;
    birthdayMaxValue: number;

    constructor(private platform: Platform,
                private zone: NgZone,
                private navController: NavController,
                private menuController: MenuController,
                private modalController: ModalController,
                protected popoverController: PopoverController,
                private toastController: ToastController,
                private splashScreen: SplashScreen,
                private alertController: AlertController,
                private loadingController: LoadingController,
                private translateService: TranslateService,
                private likeService: LikeService,
                protected itemUsersService: ItemUsersService,
                private lastItemsService: LastItemsService,
                private userSessionService: UserSessionService,
                private storageService: StorageService,
                private itemsService: ItemsService,
                private loginService: LoginService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private subscriptionService: SubscriptionService,
                private notificationService: NotificationService,
                private navParamsService: NavParamsService,
                private userProfileService: UserProfileService,
                private appRoutingPreloaderService: AppRoutingPreloaderService) {

        super(popoverController, itemUsersService);

        this.stackConfig = {
            allowedDirections: [Direction.LEFT, Direction.RIGHT],
            throwOutConfidence: (offsetX, offsetY, element) => {
                return Math.min(Math.abs(offsetX) / (element.offsetWidth / 1.8), 1);
            },
            transform: (element, x, y, r) => {
                this.onItemMove(element, x, y, r);
            },
            throwOutDistance: (d) => {
                return 800;
            }
        };

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ITEMS.ITEMS);
    }

    ngOnInit() {
        this.firstSuperstarMsg();

        this.birthdayMaxValue = moment().year() - this.RESOURCES.ITEM.USER_RESTRICTIONS.AGE.MIN;

        this.guessLocalDateFormat().then((format: string) => {
            this.birthdayDateFormat = format;
        });
    }

    async ionViewWillEnter() {
        this.hideSplashScreen(this.platform, this.splashScreen, this.loginService);

        await this.enableMenu(this.menuController, true, false);

        this.user = this.userSessionService.getUser();

        if (this.userSessionService.shouldUserBeSaved()) {
            this.reset();
            this.findItems(false);
        } else {
            this.init();
        }
    }

    async ionViewDidEnter() {
        this.swingStack.throwin.subscribe((event: DragEvent) => {
            (<HTMLElement> event.target.children.item(0)).style.display = 'none';
            (<HTMLElement> event.target.children.item(1)).style.display = 'none';
        });

        this.displayInfoCompleteProfile();

        await this.appRoutingPreloaderService.preloadRoute('item-details');
    }

    async ngOnDestroy() {
        await this.destroyAllSwingCards();
    }

    private init() {

        this.searchDisliked = this.lastItemsService.searchDisliked;

        // If we still have items in memory and if user didn't change his profile, use them, otherwise find new items
        if (this.lastItemsService.hasItems()) {
            this.items = this.lastItemsService.items;
            this.pageIndex = this.lastItemsService.pageIndex;

            this.setItemAndInformations(true, false);
        } else {
            this.reset();
            this.findItems(false);
        }
    }

    private reset() {
        this.items = new Array();

        this.lastItem = null;
        this.lastItemUser = null;
        this.lastItemUserLoaded = false;
        this.lastItemsService.reset();

        this.resetPageIndex();
        this.lastPageReached = false;

        this.previousItem = null;

        this.sameUser = false;
    }

    private setItemAndInformations(useLastItemUser: boolean, saveTmpPreviousItem: boolean) {
        this.lastItemUserLoaded = false;

        // Save current as previous to revert it into stack if user want to review it
        this.previousItem = saveTmpPreviousItem ? this.lastItem : null;

        if (this.hasItems()) {
            this.lastItem = this.items[this.items.length - 1];
            this.sameUser = this.isSameUser();

            if (useLastItemUser && !Comparator.isEmpty(this.lastItemsService.itemUser)) {
                this.lastItemUser = this.lastItemsService.itemUser;
                this.lastItemUserLoaded = true;
            } else {
                const promises = new Array();

                promises.push(this.findInterests());
                promises.push(this.markSuperstarNotificationRead());

                forkJoin(promises).subscribe(
                    (data: any) => {
                        // Do nothing
                    });
            }
        } else {
            this.lastItem = null;
            this.lastItemUser = null;
            this.lastItemUserLoaded = true;
            this.sameUser = false;
        }

        this.actionJobIsDone();

        // Save current items into service
        this.lastItemsService.items = this.items;
    }

    private isSameUser() {
        return !Comparator.isEmpty(this.user) && !Comparator.isEmpty(this.lastItem) && !Comparator.isEmpty(this.lastItem.user) && Comparator.equals(this.user._id, this.lastItem.user._id);
    }

    private actionJobIsDone() {
        this.actionInProgress = false;
        this.animateDislike = false;
        this.animateBookmark = false;
    }

    private findItems(onlyDisliked: boolean) {
        this.itemsService.findNewItems(this.user, this.pageIndex, onlyDisliked, this.lastItemsService.countDisliked).then((itemsResponse: Item[]) => {
            if (Comparator.isEmpty(this.items)) {
                this.items = new Array();
            }

            if (Comparator.hasElements(itemsResponse)) {
                this.items = itemsResponse.concat(this.items);

                // First load
                if (this.pageIndex === 0) {
                    this.setItemAndInformations(false, false);
                }

                this.incPageIndex();

                if (Comparator.isEmpty(itemsResponse) || itemsResponse.length < this.RESOURCES.API.PAGINATION.LIMIT_ITEMS) {
                    this.lastPageReached = true;
                    this.setSearchDisliked(false);
                }
            } else {
                this.lastPageReached = true;
                this.setSearchDisliked(false);
            }

            if (onlyDisliked && this.pageIndex === 1) {
                this.checkSubscriptionReviewDisliked();
            }

        }, (errorResponse: HttpErrorResponse) => {
            // Nothing found
            this.items = new Array();

            this.lastPageReached = true;
            this.setSearchDisliked(false);
        });
    }

    hasItems(): boolean {
        return Comparator.hasElements(this.items);
    }

    // Like and dislike

    private likeDislike(like: boolean) {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ITEMS, like ? this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ITEMS.LIKE : this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ITEMS.DISLIKE);

        if (!like) {
            this.lastItemsService.countDisliked++;
        }

        this.likeService.likeDislike(this.lastItem._id, like).then(() => {
            if (like) {
                this.saveInterests(this.lastItemUser).then(() => {
                    this.goToNextItem(true);
                });
            } else {
                this.goToNextItem(false);
            }
        }, async (response: HttpErrorResponse) => {
            await this.errorMsg(this.toastController, this.translateService, 'ERRORS.ITEMS.ACTION_ERROR');
        });
    }

    dislikeThrowout() {
        if (this.actionInProgress) {
            this.redoStack();
            return;
        }

        this.actionInProgress = true;

        this.zone.run(() => {
            this.doDislike();
        });
    }

    async reviewDisliked() {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ITEMS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ITEMS.REVIEW_DISLIKE);

        if (this.previousItem == null) {
            return;
        }

        this.actionInProgress = true;

        if (this.subscriptionService.couldReviewDisliked()) {
            this.revertPreviousCardToStack();
            this.actionJobIsDone();
        } else {
            const modal: HTMLIonPopoverElement = await this.getProductModal();

            modal.onDidDismiss().then((detail: OverlayEventDetail) => {
                if (detail && detail.data) {
                    this.revertPreviousCardToStack();
                }

                this.actionJobIsDone();
            });

            await modal.present();
        }
    }

    private revertPreviousCardToStack() {
        this.items.push(this.previousItem);

        this.redoStack();

        this.setItemAndInformations(false, false);

        // Animate card
        this.animateReview = true;
        setTimeout(() => {
            this.animateReview = false;
        }, 800);
    }

    dislike() {
        if (this.actionInProgress) {
            return;
        }

        this.zone.run(() => {
            this.actionInProgress = true;

            this.animateDislike = true;

            setTimeout(() => {
                this.doDislike();
            }, 200);
        });
    }

    like() {
        if (this.actionInProgress) {
            return;
        }

        this.zone.run(() => {
            this.actionInProgress = true;

            this.animateBookmark = true;

            this.subscriptionService.couldAddLike().then((result: boolean) => {
                if (result) {
                    this.doLike();
                } else {
                    this.showProductModal(this.doLikeCallback);
                }
            });
        });
    }

    private doLikeCallback = () => {
        this.doLike();
    };

    goToNextItem(like: boolean) {
        if (this.hasItems()) {
            this.destroyLastSwingCard();
            this.items.pop();
            this.lastItemUser = null;
            this.lastItemsService.itemUser = null;
        }

        this.setItemAndInformations(false, !like);

        if (!this.lastPageReached && (!this.hasItems() || this.items.length === this.RESOURCES.API.PAGINATION.LOAD_NEXT_ITEMS)) {
            if (!this.hasItems()) {
                this.resetPageIndex();
            }

            this.findItems(this.searchDisliked);
        }
    }

    // Destroy top card, remove Hammerjs events listeners
    private destroyLastSwingCard() {
        if (this.swingCards && this.swingCards.last && this.swingCards.last.getCard()) {
            this.swingCards.last.getCard().destroy();
        }
    }

    private destroyAllSwingCards(): Promise<void> {
        return new Promise((resolve) => {
            if (this.swingCards && this.swingCards.length > 0) {
                this.swingCards.forEach((card: SwingCardDirective) => {
                    if (card.getCard()) {
                        card.getCard().destroy();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    private getLastSwingCard() {
        return this.swingCards && this.swingCards.last ? this.swingCards.last.getCard() : null;
    }


    private doLike() {
        if (!this.likeInfoMsg) {
            this.storageService.retrieveLikeInfoWasSeenOnce().then((seen: boolean) => {
                if (seen) {
                    this.likeInfoMsg = true;
                    this.likeDislike(true);
                } else {
                    this.displayConfirmLikeDislike(true);
                }
            });
        } else {
            this.likeDislike(true);
        }
    }

    private doDislike() {
        if (!this.dislikeInfoMsg) {
            this.storageService.retrieveDislikeInfoWasSeenOnce().then((seen: boolean) => {
                if (seen) {
                    this.dislikeInfoMsg = true;
                    this.likeDislike(false);
                } else {
                    this.displayConfirmLikeDislike(false);
                }
            });
        } else {
            this.likeDislike(false);
        }
    }

    private displayConfirmLikeDislike(like: boolean) {

        const promises = new Array();
        promises.push(this.translateService.get('ITEMS.FIRST_ACTIONS.BOOKMARK_TEXT'));
        promises.push(this.translateService.get('ITEMS.FIRST_ACTIONS.DISLIKE_TEXT'));
        promises.push(this.translateService.get('ITEMS.FIRST_ACTIONS.GET_IT'));
        promises.push(this.translateService.get('CORE.CANCEL'));

        forkJoin(promises).subscribe(
            async (data: string[]) => {
                if (!Comparator.isEmpty(data) && data.length === promises.length) {

                    const confirm: HTMLIonAlertElement = await this.alertController.create({
                        message: like ? data[0] : data[1],
                        buttons: [
                            {
                                text: data[3],
                                handler: () => {
                                    this.zone.run(() => {
                                        this.actionJobIsDone();
                                        this.redoStack();
                                    });
                                }
                            },
                            {
                                text: data[2],
                                handler: () => {
                                    this.zone.run(() => {
                                        if (like) {
                                            this.likeInfoMsg = true;
                                        } else {
                                            this.dislikeInfoMsg = true;
                                        }

                                        const promise = like ? this.storageService.saveLikeInfoSeenOnce(true) : this.storageService.saveDislikeInfoSeenOnce(true);

                                        promise.then(() => {

                                            this.likeDislike(like);
                                        });
                                    });
                                }
                            }
                        ],
                        backdropDismiss: false
                    });

                    confirm.present();
                }
            });

    }

    // Interests

    private initItemUsers() {
        if (Comparator.isEmpty(this.lastItemUser)) {
            this.lastItemUser = new ItemUser(this.user, this.lastItem);
        }
    }

    private findInterests(): Promise<{}> {
        return new Promise((resolve) => {
            this.itemUsersService.calculateInterests(this.user, this.lastItem).then((itemInterests: ItemInterest[]) => {
                this.initItemUsers();
                this.lastItemUser.interests = itemInterests;
                this.lastItemsService.itemUser = this.lastItemUser;
                this.lastItemUserLoaded = true;
                resolve();
            }, () => {
                // Do nothing.
                this.lastItemUserLoaded = true;
                resolve();
            });
        });
    }

    // Navigate

    async navigateToDetail() {
        if (this.actionInProgress) {
            return;
        }

        const displayFirstMsg: boolean = await this.initOrGetFirstAccessMsg();
        if (displayFirstMsg) {
            this.delayHideFirstAccessMsg();
            return;
        }

        this.navParamsService.setItemDetailsNavParams({
            item: this.lastItem,
            itemUser: this.lastItemUser,
            itemSwingCard: this.getLastSwingCard(),
            backUrl: '/items'
        });

        await this.navController.navigateForward('/item-details');
    }

    navigateToAppointmentThrowout() {
        if (this.actionInProgress || this.sameUser) {
            this.redoStack();
            return;
        }

        this.navigateToAppointment();
    }

    async navigateToAppointment() {
        this.actionInProgress = true;

        const modal: HTMLIonModalElement = await this.modalController.create({
            component: ItemAppointmentsModal,
            componentProps: {
                item: this.lastItem,
                itemUser: this.lastItemUser,
                itemSwingCard: this.getLastSwingCard()
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            if (detail && !detail.data) {
                this.redoStack();
            }

            this.init();

            this.displayInfoCompleteProfile();
        });

        await modal.present();
    }

    private redoStack() {
        // Redo previous item at the top
        // Hacky way to do it because stack swipe doesn't work well to push back a data
        this.items = JSON.parse(JSON.stringify(this.items));
        this.lastItemsService.items = this.items;
        this.lastItemsService.pageIndex = this.pageIndex;
    }

    navigateToItemParams() {
        this.navController.navigateForward('/item-params');
    }

    private firstSuperstarMsg() {
        this.storageService.retrieveSuperstarWasSeenOnce().then((itemsSeensOnce: boolean) => {
            this.displayFirstSuperstarMsg = itemsSeensOnce == null || !itemsSeensOnce;
        });
    }

    closeSuperstarMsg() {
        this.displayFirstSuperstarMsg = false;

        this.storageService.saveSuperstarWasSeenOnce(true).then(() => {
            // Do nothing
        });
    }

    isAddressInitialized(): boolean {
        // Per default, user address only contains location 0,0
        return !Comparator.isEmpty(this.user) && !Comparator.isStringEmpty(this.user.userParams.address.addressName);
    }

    // Swing - swipe cards - Called whenever we drag an element
    private onItemMove(element, x, y, r) {

        // Only allow users to swipe the top card
        if (Comparator.hasElements(this.items) && (parseInt(element.style['zIndex'], 0) - 1) !== this.items.length - 1) {
            return;
        }

        this.ySwing = y === 0 ? y : this.ySwing++;

        const abs = Math.abs(x);
        const min = Math.trunc(Math.min(16 * 16 - abs, 16 * 16));

        const opacity: number = 1 - (min / (16 * 16));

        if (x < 0) {
            element.children[1].style.display = 'block';
            element.children[1].style.opacity = opacity;
        } else {
            element.children[0].style.display = 'block';
            element.children[0].style.opacity = opacity;
        }

        element.style['transform'] = `translate3d(0, 0, ${element.style.zIndex}px) translate(${x}px, ${this.ySwing}px) rotate(${r}deg)`;
    }

    loadDislikedItems() {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ITEMS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ITEMS.REVIEW_DISLIKE);

        this.resetPageIndex();
        this.lastPageReached = false;

        this.setSearchDisliked(true);

        this.findItems(this.searchDisliked);
    }

    // Subscription

    private async checkSubscriptionReviewDisliked() {
        if (!this.subscriptionService.couldReviewDisliked()) {
            const modal: HTMLIonPopoverElement = await this.getProductModal();

            modal.onDidDismiss().then((detail: OverlayEventDetail) => {
                if (detail && !detail.data) {
                    this.reset();
                    this.lastPageReached = true;
                }
            });

            await modal.present();
        }
    }

    renderSlides(i: number): boolean {
        return Comparator.hasElements(this.items) && (this.items.length < 3 || i >= this.items.length - 2);
    }

    private isItemStarred(item: Item): boolean {
        return ItemsComparator.isItemStarred(item);
    }

    private markSuperstarNotificationRead(): Promise<{}> {
        return new Promise((resolve) => {
            if (Comparator.isEmpty(this.lastItem) || !this.isItemStarred(this.lastItem)) {
                resolve();
            } else {
                this.notificationService.markSuperstarNotificationAsRead(this.lastItem._id).then(() => {
                    resolve();
                }, () => {
                    resolve();
                });
            }
        });
    }

    private incPageIndex() {
        this.pageIndex += 1;
        this.lastItemsService.pageIndex = this.pageIndex;
    }

    private resetPageIndex() {
        this.pageIndex = 0;
        this.lastItemsService.pageIndex = this.pageIndex;
    }

    private setSearchDisliked(value: boolean) {
        this.searchDisliked = value;
        this.lastItemsService.searchDisliked = value;
        this.lastItemsService.countDisliked = 0;
    }

    // Help users to complete their profile

    private displayInfoCompleteProfile() {
        if (this.lastItemsService.displayCompleteProfileMsg) {
            this.lastItemsService.displayCompleteProfileMsg = false;

            this.storageService.retrieveProfileWasCompletedOnce().then((completed: boolean) => {
                if (!completed) {
                    this.displayMsgCompleteProfile();
                }
            });
        }
    }

    private async displayMsgCompleteProfile() {
        const msg: string = this.translateService.instant('ITEMS.FIRST_ACCESS.COMPLETE_PROFILE');
        const ok: string = this.translateService.instant('CORE.OK');
        const cancel: string = this.translateService.instant('CORE.CANCEL');

        const confirm: HTMLIonAlertElement = await this.alertController.create({
            message: msg,
            buttons: [
                {
                    text: cancel,
                    handler: () => {
                        this.completeProfileMsg(false);
                    }
                },
                {
                    text: ok,
                    handler: () => {
                        this.completeProfileMsg(true);
                    }
                }
            ],
            backdropDismiss: false
        });

        confirm.present();
    }

    private completeProfileMsg(navigate: boolean) {
        this.storageService.saveProfileCompletedOnce(true).then(() => {
            if (navigate) {
                this.navController.navigateForward('/user-profile');
            }
        });
    }

    // First access, explain navigation

    private initOrGetFirstAccessMsg(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (this.displayFirstAccessMsg == null) {
                this.storageService.retrieveItemsNavInfoWasSeenOnce().then((seenOnce: boolean) => {
                    this.displayFirstAccessMsg = seenOnce == null || !seenOnce;
                    resolve(this.displayFirstAccessMsg);
                });
            } else {
                resolve(this.displayFirstAccessMsg);
            }
        });
    }

    private delayHideFirstAccessMsg() {
        setTimeout(() => {
            this.displayFirstAccessMsg = false;
        }, this.RESOURCES.TIME_OUT.NOTIFICATION.DISPLAY_FIRST_MSG_SHORT);

        this.storageService.saveItemsNavInfoSeenOnce(true).then(() => {
            // Do nothing
        });
    }

    async initFirstAccessMsg() {
        const displayFirstMsg: boolean = await this.initOrGetFirstAccessMsg();
        if (displayFirstMsg) {
            this.delayHideFirstAccessMsg();
            return;
        }
    }

    hideFirstAccessMsg() {
        this.displayFirstAccessMsg = false;
    }

    hideFirstAccessMsgClick($event) {
        $event.preventDefault();
        $event.stopPropagation();

        this.hideFirstAccessMsg();
    }

    isBirthdayDefined(): boolean {
        return !Comparator.isEmpty(this.user) && !Comparator.isEmpty(this.user.facebook) && this.user.facebook.birthday !== null;
    }

    addBirthday() {
        if (this.isBirthdayDefined() || Comparator.isEmpty(this.birthdayPicker)) {
            return;
        }

        this.birthdayPicker.open();
    }

    private guessLocalDateFormat(): Promise<string> {
        return new Promise((resolve) => {
            if (this.isBirthdayDefined()) {
                resolve(null);
            } else {
                const endOfAJulyMonth: string = moment().year(2018).month(6).date(30).toDate().toLocaleDateString();
                const format: string = endOfAJulyMonth.indexOf('07') === 0 ? 'MM-DD-YYYY' : 'DD-MM-YYYY';

                resolve(format);
            }
        });
    }

    async updateBirthday($event: any) {
        if (Comparator.isEmpty($event) || Comparator.isEmpty($event.detail) || Comparator.isStringEmpty($event.detail.value) ||
            Comparator.isEmpty(this.user) || Comparator.isEmpty(this.user.facebook)) {
            return;
        }

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ITEMS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ITEMS.UPDATE_BIRTHDAY);

        this.user.facebook.birthday = moment($event.detail.value).toDate();

        this.userSessionService.setUserToSave(this.user);
        await this.saveUserIfNeeded(this.toastController, this.loadingController, this.translateService, this.userProfileService, this.userSessionService, this.user);

        this.reset();
        this.findItems(false);
    }

}
