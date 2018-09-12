// Model
import {Item} from './item';
import {User, UserInterest} from '../user/user';

export class ItemInterest {

    interest: UserInterest;

    time: number;

    constructor(_interest: UserInterest, _time: number) {
        this.interest = _interest;
        this.time = _time;
    }

}

export class ItemMatching {

    score: number;

    constructor(_score: number) {
        this.score = _score;
    }

}


export class ItemUser {

    user: User;

    item: Item;

    interests: ItemInterest[];

    matching: ItemMatching;

    createdAt: Date;
    updatedAt: Date;

    constructor(_user: User, _item: Item) {
        this.user = _user;
        this.item = _item;

        this.interests = new Array<ItemInterest>();
    }

}
