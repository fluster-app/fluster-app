import {Input} from '@angular/core';

import {Subscription} from 'rxjs';

// Model
import {ChatMessage} from '../../services/model/chat/chat';
import {User} from '../../services/model/user/user';

// Utils
import {Comparator} from '../../services/core/utils/utils';

// Services
import {ChatWatcherService} from '../../services/core/notification/chat-watcher-service';

export abstract class AbstractNoficationComponent {

    @Input() user: User;

    protected allUser: boolean = false;

    notified: boolean = false;
    chatMessages: ChatMessage[] = new Array();
    countNewChatMessages: number = 0;

    private newChatMessageSubscription: Subscription;
    private resetChatMessageSubscription: Subscription;

    constructor(protected chatWatcherService: ChatWatcherService) {
        this.newChatMessageSubscription = this.chatWatcherService.newChatMessage.subscribe((newMessages: ChatMessage[]) => {
            // Notification always one new ChatMessage
            if (Comparator.hasElements(newMessages) && this.isSelectedUser(newMessages[0])) {
                this.hasNewMessages(newMessages).then((result: boolean) => {
                    this.notified = result;
                });

                this.doCountAndFilterNewMessages(newMessages, true).then(() => {
                    // Do nothing
                });
            }
        });

        this.resetChatMessageSubscription = this.chatWatcherService.resetChatMessage.subscribe((userFromId) => {
            if ((this.allUser && Comparator.isEmpty(this.chatWatcherService.getChatMessages())) ||
                (!Comparator.isStringEmpty(userFromId) && !Comparator.isEmpty(this.user) && Comparator.equals(userFromId, this.user._id))) {
                this.notified = false;
                this.chatMessages = new Array();
                this.countNewChatMessages = 0;
            }

        });
    }

    private isSelectedUser(message: ChatMessage): boolean {
        return this.allUser || (!Comparator.isEmpty(this.user) && Comparator.equals(message.userFrom, this.user._id));
    }

    protected afterViewInit(): Promise<{}> {
        return new Promise((resolve) => {
            const chatMessages: ChatMessage[] = this.chatWatcherService.getChatMessages();

            this.hasNewMessages(chatMessages).then((result: boolean) => {
                this.notified = result;
                resolve();
            });

            this.doCountAndFilterNewMessages(chatMessages, false).then(() => {
                // Do nothing
            });
        });
    }

    protected unsubscribe() {
        if (this.newChatMessageSubscription != null) {
            this.newChatMessageSubscription.unsubscribe();
        }

        if (this.resetChatMessageSubscription != null) {
            this.resetChatMessageSubscription.unsubscribe();
        }
    }

    protected hasNewMessages(chatMessages: ChatMessage[]): Promise<{}> {
        return new Promise((resolve) => {
            if (Comparator.hasElements(chatMessages)) {
                if (this.allUser) {
                    resolve(true);
                } else {
                    let result: boolean = false;

                    for (let i = 0; i < chatMessages.length; i++) {
                        // Both values not populated
                        if (this.isSelectedUser(chatMessages[i])) {
                            result = true;
                            break;
                        }
                    }

                    resolve(result);
                }
            } else {
                resolve(false);
            }
        });
    }

    hasChatMessages(): boolean {
        return Comparator.hasElements(this.chatMessages);
    }

    private doCountAndFilterNewMessages(chatMessages: ChatMessage[], checkAlreadyContaining: boolean): Promise<{}> {
        return new Promise((resolve) => {
            if (Comparator.hasElements(chatMessages)) {

                for (let i = 0; i < chatMessages.length; i++) {
                    // Both values not populated
                    if (this.isSelectedUser(chatMessages[i])) {
                        if (checkAlreadyContaining && this.containsChatMessages(chatMessages[i])) {
                            const oldChatMessage: ChatMessage[] = this.chatMessages.splice(i, 1);
                            this.countNewChatMessages -= Comparator.hasElements(oldChatMessage[0].messages) ?
                                oldChatMessage[0].messages.length : 0;
                        }

                        this.chatMessages.push(chatMessages[i]);
                        this.countNewChatMessages += Comparator.hasElements(chatMessages[i].messages) ? chatMessages[i].messages.length : 0;
                    }
                }

                resolve();
            } else {
                resolve();
            }
        });
    }

    private containsChatMessages(chatMessage: ChatMessage): boolean {
        let contained: boolean = false;

        for (let i = 0; i < this.chatMessages.length; i++) {
            if (Comparator.equals(this.chatMessages[i]._id, chatMessage._id)) {
                contained = true;
                break;
            }
        }

        return contained;
    }

}
