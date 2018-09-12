import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';

// Model
import {ChatMessage} from '../../model/chat/chat';

// Utils and resources
import {Resources} from '../../core/utils/resources';
import {Comparator} from '../../core/utils/utils';

// Services
import {SocketIoService} from './socket-io-service';
import {ChatService} from '../chat/chat-service';

@Injectable({
    providedIn: 'root'
})
export class ChatWatcherService {

    private messages: ChatMessage[] = new Array();

    private newChatMessageSource: Subject<ChatMessage[]> = new Subject<ChatMessage[]>();
    private resetChatMessageSource: Subject<string> = new Subject<string>();

    newChatMessage: Observable<ChatMessage[]> = this.newChatMessageSource.asObservable();
    resetChatMessage: Observable<string> = this.resetChatMessageSource.asObservable();

    constructor(private socketIoService: SocketIoService,
                private chatService: ChatService) {
    }

    initSocketIoListener() {
        this.socketIoService.on(Resources.Constants.NOTIFICATION.TYPE.CHAT_NEW_MESSAGE, (chatMessage: ChatMessage) => {
            this.findChatMessageIndexWithId(chatMessage).then((index: number) => {
                if (index > -1) {
                    this.messages.splice(index, 1);
                }

                this.messages.push(chatMessage);

                this.emitNewMessage(chatMessage);
            });
        });
    }

    private findChatMessageIndexWithId(chatMessage: ChatMessage): Promise<number> {
        return new Promise((resolve) => {
            if (Comparator.hasElements(this.messages)) {
                let index: number = -1;

                for (let i = 0; i < this.messages.length; i++) {
                    if (Comparator.equals(this.messages[i]._id, chatMessage._id)) {
                        index = i;
                        break;
                    }
                }

                resolve(index);
            } else {
                resolve(-1);
            }
        });
    }

    getChatMessages(): ChatMessage[] {
        return this.messages;
    }

    getTotalChatMessages(): number {
        return Comparator.hasElements(this.messages) ? this.messages.length : 0;
    }

    private emitNewMessage(newMessage: ChatMessage) {
        const tmp: ChatMessage[] = new Array();
        tmp.push(newMessage);

        this.emitNewMessages(tmp);
    }

    private emitNewMessages(newMessages: ChatMessage[]) {
        this.newChatMessageSource.next(newMessages);
    }

    initNewMessages(): Promise<{}> {
        return new Promise((resolve) => {
            this.messages = new Array();

            this.chatService.getUnreadChatMessages().then((data: ChatMessage[]) => {
                if (!Comparator.isEmpty(data)) {
                    this.messages = data;
                }

                resolve(this.messages);
            }, (errorResponse: HttpErrorResponse) => {
                // Ignore error
                resolve(this.messages);
            });
        });
    }

    removeMessageFromStack(userFromId: string) {
        this.removeChatMessageFromStack(userFromId).then(() => {
            this.resetChatMessageSource.next(userFromId);
        });
    }

    private removeChatMessageFromStack(userFromId: string): Promise<{}> {

        return new Promise((resolve) => {
            if (Comparator.hasElements(this.messages)) {
                const index: number = this.findChatMessageIndex(userFromId);

                if (index != null) {
                    this.messages.splice(index, 1);
                }

                resolve();
            } else {
                resolve();
            }
        });
    }

    private findChatMessageIndex(userFromId: string) {
        for (let i = 0; i < this.messages.length; i++) {
            // UserFrom not populated
            if (Comparator.equals(this.messages[i].userFrom, userFromId)) {
                return i;
            }
        }

        return null;
    }

}
