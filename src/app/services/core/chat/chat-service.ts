import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';

// Model
import {Applicant} from '../../model/appointment/applicant';
import {Chat, ChatMessage} from '../../model/chat/chat';
import {Device} from '../../model/device/device';

// Resources and utils
import {Resources} from '../../core/utils/resources';
import {AccessTokenBody, AccessTokenService} from '../user/access-token-service';
import {Comparator} from '../utils/utils';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService) {

    }

    findChats(applicant: Applicant): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                if (!Comparator.isEmpty(applicant.item) && !Comparator.isStringEmpty(applicant.item._id)) {
                    // Populated item
                    params = params.append('itemId', applicant.item._id);
                } else if (!Comparator.isStringEmpty('' + applicant.item)) {
                    // Not populated item
                    params = params.append('itemId', '' + applicant.item);
                }

                params = params.append('applicantId', applicant._id);

                this.httpClient.get(Resources.Constants.API.CHATS, {params: params})
                    .subscribe((data: Chat[]) => {
                        resolve(data);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    createChat(chat: Chat): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['chat'] = chat;

                this.httpClient.post(Resources.Constants.API.CHATS, body, {headers: headers})
                    .subscribe((createdChat: Chat) => {
                        resolve(createdChat);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    postChatMessage(chat: Chat, message: string, socketIOId: string, userToId: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['chatId'] = chat._id;
                body['message'] = message;
                body['socketIOId'] = socketIOId;
                body['userToId'] = userToId;

                this.httpClient.post(Resources.Constants.API.CHATS_MESSAGES, body, {headers: headers})
                    .subscribe((createdMsg: ChatMessage) => {
                        resolve(createdMsg);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    findChatMessages(chat: Chat, pageIndex: number): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                params = params.append('pageIndex', '' + pageIndex);
                params = params.append('chatId', chat._id);

                this.httpClient.get(Resources.Constants.API.CHATS_MESSAGES, {params: params})
                    .subscribe((data: ChatMessage[]) => {
                        resolve(data);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    updateChatMessage(chatMessage: ChatMessage, socketIOId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['chatMessage'] = chatMessage;
                body['socketIOId'] = socketIOId;

                this.httpClient.put(Resources.Constants.API.CHATS_MESSAGES + chatMessage._id, body, {headers: headers})
                    .subscribe((data: ChatMessage) => {
                        resolve(data);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    findDevice(searchedUserId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const params: HttpParams = await this.accessTokenService.getHttpParams();

                this.httpClient.get(Resources.Constants.API.DEVICES + searchedUserId, {params: params})
                    .subscribe((device: Device) => {
                        resolve(device);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    getUnreadChatMessages(): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const params: HttpParams = await this.accessTokenService.getHttpParams();

                this.httpClient.get(Resources.Constants.API.CHATS_MESSAGES_UNREAD, {params: params})
                    .subscribe((data: ChatMessage[]) => {
                        resolve(data);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

}
