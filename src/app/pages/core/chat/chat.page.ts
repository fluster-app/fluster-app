import {Component, ElementRef, Input, NgZone, OnInit, ViewChild} from '@angular/core';
import {ActionSheetController, Content, NavController, Platform, ToastController, ModalController} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';
import {HttpErrorResponse} from '@angular/common/http';

import {TranslateService} from '@ngx-translate/core';

import {forkJoin, Subscription} from 'rxjs';

import * as moment from 'moment';

// Abstract
import {AbstractPage} from '../../abstract-page';

// Modal
import {RescheduleAppointmentsModal} from '../../../modals/advertise/reschedule-appointments/reschedule-appointments';

// Model
import {User, UserFacebook, UserGoogle} from '../../../services/model/user/user';
import {Chat, ChatMessage} from '../../../services/model/chat/chat';
import {Applicant} from '../../../services/model/appointment/applicant';
import {Device} from '../../../services/model/device/device';
import {Item} from '../../../services/model/item/item';
import {ItemUser} from '../../../services/model/item/item-user';

// Utils and comparator
import {Comparator, Converter} from '../../../services/core/utils/utils';

// Service
import {UserSessionService} from '../../../services/core/user/user-session-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {ChatService} from '../../../services/core/chat/chat-service';
import {SocketIoService} from '../../../services/core/notification/socket-io-service';
import {ChatWatcherService} from '../../../services/core/notification/chat-watcher-service';
import {ChatNavParams, NavParamsService} from '../../../services/core/navigation/nav-params-service';

@Component({
    selector: 'app-chat',
    styleUrls: ['./chat.page.scss'],
    templateUrl: './chat.page.html'
})
export class ChatPage extends AbstractPage implements OnInit {

    @ViewChild(Content, {read: Content}) chatContent: Content;
    @ViewChild('msgInput', {read: ElementRef}) msgInput: ElementRef;

    @Input() message: string;
    sendingMsg: boolean = false;

    lastMsgUpdated: boolean = true;

    private user: User;

    private applicant: Applicant;
    private item: Item;
    private itemUser: ItemUser;

    otherUserStarred: boolean = false;

    private chat: Chat;

    private otherUserDevice: Device;

    chatMessages: ChatMessage[] = null;

    private pageIndex: number = 0;
    private lastPageReached: boolean = false;

    scrollToBottomDone: boolean = false;
    loading: boolean = false;
    private lastScrollTop: number = 0;

    private newChatMessageSubscription: Subscription;

    constructor(private platform: Platform,
                private zone: NgZone,
                private toastController: ToastController,
                private actionSheetController: ActionSheetController,
                private navController: NavController,
                private modalController: ModalController,
                private translateService: TranslateService,
                private userSessionService: UserSessionService,
                private chatService: ChatService,
                private socketIoService: SocketIoService,
                private chatWatcherService: ChatWatcherService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private navParamsService: NavParamsService) {
        super();

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.CHAT);
    }

    async ngOnInit() {
        this.user = this.userSessionService.getUser();

        try {
            const chatNavParams: ChatNavParams = await this.navParamsService.getChatNavParams();

            this.isAdDisplay = chatNavParams.adDisplay === true;

            this.applicant = chatNavParams.applicant;
            this.item = chatNavParams.item;
            this.itemUser = chatNavParams.itemUser;

            const userStarred: boolean = chatNavParams.userStarred;
            this.otherUserStarred = userStarred != null && userStarred;

            this.initChat();
        } catch (err) {
            // Load nothing
        }
    }

    ionViewDidEnter() {
        window.addEventListener('keyboardDidShow', this.showKeyboardScrollToBottom);
        window.addEventListener('keyboardDidHide', this.hideKeyboardScrollToBottom);

        this.newChatMessageSubscription = this.chatWatcherService.newChatMessage.subscribe((newMessages: ChatMessage[]) => {
            if (Comparator.hasElements(newMessages) && newMessages.length === 1 && !Comparator.isEmpty(this.user)) {
                if (Comparator.equals(newMessages[0].userTo, this.user._id)) {
                    this.lastMsgUpdated = false;

                    this.addMessageToList(newMessages[0]);
                    this.updateMessageRead(newMessages[0]).then(() => {
                        this.lastMsgUpdated = true;
                    });
                }
            }
        });

        this.socketIoService.on(this.RESOURCES.NOTIFICATION.TYPE.CHAT_UPDATE_MESSAGE, (chatMessage: ChatMessage) => {
            this.updateMessageWasRead(chatMessage);
        });

        this.socketIoService.on(this.RESOURCES.NOTIFICATION.TYPE.DEVICE_UPDATE, (updatedDevice: Device) => {
            // User of the device not populated
            if (this.isInitialized() && !Comparator.isEmpty(updatedDevice) && !Comparator.isEmpty(this.getOtherUserId()) && Comparator.equals(this.getOtherUserId(), updatedDevice.user)) {
                this.otherUserDevice = updatedDevice;
            }
        });
    }

    scrollTopFindChatMessages($event: any) {
        if (!Comparator.isEmpty($event) && !Comparator.isEmpty($event.detail)) {
            if ($event.detail.scrollTop <= 10 && $event.detail.startY > 1 && $event.detail.scrollTop < this.lastScrollTop && !this.lastPageReached && !this.loading) {
                this.zone.run(() => {
                    this.findChatMessages().then(() => {
                        this.chatContent.scrollToPoint(0, 200);
                    });
                });
            }

            this.lastScrollTop = $event.detail.scrollTop;
        }
    }

    ionViewWillLeave() {
        if (this.newChatMessageSubscription != null) {
            this.newChatMessageSubscription.unsubscribe();
        }

        if (this.isInitialized()) {
            this.chatWatcherService.removeMessageFromStack(this.getOtherUserId());
        }

        this.socketIoService.off(this.RESOURCES.NOTIFICATION.TYPE.CHAT_UPDATE_MESSAGE);

        this.socketIoService.off(this.RESOURCES.NOTIFICATION.TYPE.DEVICE_UPDATE);

        window.removeEventListener('keyboardDidHide', this.hideKeyboardScrollToBottom);
        window.removeEventListener('keyboardDidShow', this.showKeyboardScrollToBottom);
    }

    private initChat() {
        this.lastMsgUpdated = false;

        this.chatService.findChats(this.applicant).then((chats: Chat[]) => {
            if (Comparator.hasElements(chats)) {
                this.chat = chats[0];

                const promises = new Array();

                promises.push(this.findChatMessages());
                promises.push(this.findOtherUserDevice());

                forkJoin(promises).subscribe(
                    (data: any[]) => {
                        this.updateLastMessageRead().then(() => {
                            this.lastMsgUpdated = true;
                        });
                    }
                );
            } else {
                this.createChat().then((createdChat: Chat) => {
                    this.chat = createdChat;
                    this.chatMessages = new Array();

                    // Avoid to start new search when we are creating an empty chat
                    this.lastPageReached = true;

                    this.findOtherUserDevice().then(() => {
                        // New chat, there is no last msg to read
                        this.lastMsgUpdated = true;
                    });
                }, async (err: HttpErrorResponse) => {
                    await this.errorMsg(this.toastController, this.translateService, 'ERRORS.CHAT.NOT_LOADED');
                });
            }
        }, async (err: HttpErrorResponse) => {
            await this.errorMsg(this.toastController, this.translateService, 'ERRORS.CHAT.NOT_LOADED');
        });
    }

    private createChat(): Promise<{}> {

        const chat: Chat = new Chat();

        chat.item = this.item;
        chat.applicant = this.applicant;

        chat.userApplicant = this.applicant.user;
        chat.userItem = this.item.user;

        return this.chatService.createChat(chat);
    }

    resizeTextarea() {
        // 67 = 3 rows / 46 = 2 rows
        if (this.msgInput.nativeElement.scrollHeight < 50) {
            this.msgInput.nativeElement.style.height = 'auto';
            this.msgInput.nativeElement.style.height = this.msgInput.nativeElement.scrollHeight + 'px';
        }
    }

    private resetSizeTextarea() {
        this.msgInput.nativeElement.style.height = '25px';
    }

    sendMessage() {
        if (this.isMessageEmpty()) {
            return;
        }

        this.sendingMsg = true;

        this.doSendMessage().then(() => {
            this.sendingMsg = false;
            this.resetSizeTextarea();
        });
    }

    private doSendMessage(): Promise<{}> {
        return new Promise((resolve) => {
            this.chatService.postChatMessage(this.chat, this.message, this.getOtherUserSocketIOId(), this.getOtherUserId()).then((chatMessage: ChatMessage) => {

                this.addMessageToList(chatMessage);

                this.message = null;

                resolve();
            }, async (err: HttpErrorResponse) => {
                await this.errorMsg(this.toastController, this.translateService, 'ERRORS.CHAT.NOT_SENT');
                resolve();
            });
        });
    }

    private getOtherUserSocketIOId(): string {
        return Comparator.isEmpty(this.otherUserDevice) ? null : this.otherUserDevice.socketIOId;
    }

    private addMessageToList(chatMessage: ChatMessage) {
        this.zone.run(() => {
            if (Comparator.isEmpty(this.chatMessages)) {
                this.chatMessages = new Array();
            }

            if (Comparator.hasElements(this.chatMessages) && !this.chatMessages[this.chatMessages.length - 1].read
                && Comparator.equals(chatMessage._id, this.chatMessages[this.chatMessages.length - 1]._id)) {
                // If last msg in the stack comes from the same user, then we have to replace it
                this.chatMessages.pop();
            }

            this.chatMessages.push(chatMessage);
        });

        this.doScrolltoBottom();
    }

    isMessageEmpty(): boolean {
        return Comparator.isStringEmpty(this.message);
    }

    private findChatMessages(): Promise<{}> {
        return new Promise((resolve) => {
            this.loading = true;

            this.chatService.findChatMessages(this.chat, this.pageIndex).then((results: ChatMessage[]) => {
                if (Comparator.isEmpty(this.chatMessages)) {
                    this.chatMessages = new Array();
                }

                if (!Comparator.isEmpty(results)) {
                    this.chatMessages = results.reverse().concat(this.chatMessages);
                }

                this.pageIndex += 1;

                if (Comparator.isEmpty(results) || results.length < this.RESOURCES.API.PAGINATION.CHAT) {
                    this.lastPageReached = true;
                }

                this.loading = false;
                resolve();
            }, async (err: HttpErrorResponse) => {
                await this.errorMsg(this.toastController, this.translateService, 'ERRORS.CHAT.NOTHING_FOUND');
                this.lastPageReached = true;
                this.loading = false;
                resolve();
            });
        });
    }

    scrollToBottomOnInit(lastItem: boolean) {
        if (lastItem && !this.scrollToBottomDone) {
            this.doScrolltoBottom(0);
            this.scrollToBottomDone = true;
        }
    }

    private doScrolltoBottom(duration?: number) {
        setTimeout(() => {
            this.chatContent.scrollToBottom(duration);
        }, 100);
    }

    isInitialized(): boolean {
        return !Comparator.isEmpty(this.chat) && this.chatMessages != null;
    }

    userMsgClass(chatMessage: ChatMessage): string {
        // chatMessage.user is not populated
        return this.isChatMessageCurrentUser(chatMessage) ? 'user' : 'notuser';
    }

    private isChatMessageCurrentUser(chatMessage: ChatMessage): boolean {
        // chatMessage is not populated
        return Comparator.equals(chatMessage.userFrom, this.user._id);
    }

    updateLastMessageRead(): Promise<{}> {
        return new Promise((resolve) => {
            if (!Comparator.hasElements(this.chatMessages)) {
                resolve();
            } else {
                const lastChatMessage: ChatMessage = this.chatMessages[this.chatMessages.length - 1];
                if (this.isChatMessageCurrentUser(lastChatMessage)) {
                    resolve();
                } else if (!lastChatMessage.read) {
                    this.updateMessageRead(lastChatMessage).then(() => {
                        resolve();
                    });
                } else {
                    resolve();
                }
            }
        });
    }

    private updateMessageRead(lastChatMessage: ChatMessage): Promise<{}> {
        return new Promise((resolve) => {
            lastChatMessage.read = true;

            this.chatService.updateChatMessage(lastChatMessage, this.getOtherUserSocketIOId()).then((updatedChatMessage: ChatMessage) => {
                this.chatMessages[this.chatMessages.length - 1] = updatedChatMessage;
                resolve();
            }, (err: HttpErrorResponse) => {
                // Don't display error
                resolve();
            });
        });
    }

    private findOtherUserDevice(): Promise<{}> {
        return new Promise((resolve) => {

            this.chatService.findDevice(this.getOtherUserId()).then((device: Device) => {
                this.otherUserDevice = device;
                resolve();
            }, (err: HttpErrorResponse) => {
                // Do nothing on error
                resolve();
            });

        });
    }

    private getOtherUserId(): string {
        return this.isCurrentUserItemUser() ? this.chat.userApplicant._id : this.chat.userItem._id;
    }

    private isCurrentUserItemUser(): boolean {
        return Comparator.equals(this.chat.userItem._id, this.user._id);
    }

    isApplicantReschedule(): boolean {
        return this.isCurrentUserItemUser() && !Comparator.isEmpty(this.applicant) && Comparator.equals(this.RESOURCES.APPLICANT.STATUS.TO_RESCHEDULE, this.applicant.status);
    }

    isApplicantAcceptedInTheFuture(): boolean {
        return this.isCurrentUserItemUser() && !Comparator.isEmpty(this.applicant) &&
            Comparator.equals(this.RESOURCES.APPLICANT.STATUS.ACCEPTED, this.applicant.status) &&
            new Date().getTime() < Converter.getDateObj(this.applicant.selected).getTime();
    }

    private updateMessageWasRead(chatMessage: ChatMessage): Promise<{}> {
        return new Promise((resolve) => {
            if (Comparator.hasElements(this.chatMessages)) {
                this.iterateAndUpdateWasRead(chatMessage);

                resolve();
            } else {
                resolve();
            }
        });
    }

    private iterateAndUpdateWasRead(chatMessage: ChatMessage) {
        for (let i = this.chatMessages.length - 1; i >= 0; i--) {
            if (Comparator.equals(this.chatMessages[i]._id, chatMessage._id)) {
                this.chatMessages[i].read = chatMessage.read;
                return;
            }
        }
    }

    getTitleUserFacebook(): UserFacebook {
        if (Comparator.isEmpty(this.chat) || Comparator.isEmpty(this.item) || Comparator.isEmpty(this.applicant)) {
            return null;
        }

        return this.isCurrentUserItemUser() ? this.applicant.user.facebook : this.item.user.facebook;
    }

    getTitleUserGoogle(): UserGoogle {
        if (Comparator.isEmpty(this.chat) || Comparator.isEmpty(this.item) || Comparator.isEmpty(this.applicant)) {
            return null;
        }

        return this.isCurrentUserItemUser() ? this.applicant.user.google : this.item.user.google;
    }

    isChatDateToBeDisplayed(index: number): boolean {
        if (!Comparator.hasElements(this.chatMessages)) {
            return false;
        }

        if (this.chatMessages.length === 1 || index === 0) {
            return true;
        }

        const startOfDayPrevious: Date = moment(this.chatMessages[index - 1].createdAt).startOf('day').toDate();
        const startOfDayCurrent: Date = moment(this.chatMessages[index].createdAt).startOf('day').toDate();

        return Converter.getDateObj(startOfDayCurrent).getTime() !== Converter.getDateObj(startOfDayPrevious).getTime();
    }

    openInformation() {
        if (this.isAdDisplay) {
            this.openApplicantInfo();
        } else {
            this.openItemDetails();
        }
    }

    private openApplicantInfo() {
        this.navParamsService.setApplicantSelectionNavParams({
            applicant: this.applicant,
            item: this.item,
            subPage: 'chat',
            userStarred: this.otherUserStarred
        });

        this.navController.navigateForward('/applicant-selection', false);
    }

    private openItemDetails() {
        this.navParamsService.setItemDetailsNavParams({
            item: this.item,
            itemUser: this.itemUser,
            bookmarked: true,
            applicant: this.applicant,
            displayChat: false,
            backUrl: '/chat'
        });

        this.navController.navigateForward('/item-details', false);
    }

    hasNoMessages(): boolean {
        return Comparator.isEmpty(this.chatMessages);
    }

    private showKeyboardScrollToBottom = (event: any) => {
        this.chatContent.scrollToBottom();
    }

    private hideKeyboardScrollToBottom = () => {
        this.chatContent.scrollToBottom();
    }

    private async openRescheduleModal() {

        const modal: HTMLIonModalElement = await this.modalController.create({
            component: RescheduleAppointmentsModal,
            componentProps: {
                applicant: this.applicant,
                item: this.item
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            // Do nothing
        });

        await modal.present();
    }

    async presentActionSheet(ev) {
        const buttons = new Array();

        if (this.isAdDisplay && (this.isApplicantReschedule() || this.isApplicantAcceptedInTheFuture())) {
            buttons.push({
                text: this.isApplicantReschedule() ? this.translateService.instant('CHAT.POPOVER.TO_RESCHEDULE') : this.translateService.instant('CHAT.POPOVER.ACCEPTED'),
                role: 'destructive',
                handler: () => {
                    this.openRescheduleModal();
                }
            });
        }

        buttons.push({
            text: this.isAdDisplay ? this.translateService.instant('CHAT.POPOVER.OPEN_APPLICANT', {who: this.getTitleUserFacebook().firstName}) : this.translateService.instant('CHAT.POPOVER.OPEN_AD', {who: this.getTitleUserFacebook().firstName}),
            handler: () => {
                this.openInformation();
            }
        });

        buttons.push({
            text: this.translateService.instant('CORE.CANCEL'),
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
