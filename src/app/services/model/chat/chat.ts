// Model
import {User} from '../user/user';
import {Item} from '../item/item';
import {Applicant} from '../appointment/applicant';

export class Chat {
    _id: string;

    item: Item;
    applicant: Applicant;

    userItem: User;
    userApplicant: User;

    createdAt: Date;
    updatedAt: Date;

}

export class ChatMessages {

    message: String;

    createdAt: Date;
    updatedAt: Date;

}

export class ChatMessage {

    constructor() {
        this.messages = new Array();
    }

    _id: string;

    chat: Chat;

    userFrom: User;
    userTo: User;

    read: boolean;
    push: boolean;

    messages: ChatMessages[];

    createdAt: Date;
    updatedAt: Date;

}
