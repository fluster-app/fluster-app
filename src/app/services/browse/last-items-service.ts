import {Injectable} from '@angular/core';

// Model
import {Item} from '../model/item/item';
import {ItemUser} from '../model/item/item-user';

// Resources
import {Comparator} from '../core/utils/utils';

@Injectable({
    providedIn: 'root'
})
export class LastItemsService {

    private $items: Item[];

    private $itemUser: ItemUser;

    private $pageIndex: number = 0;

    private $searchDisliked: boolean = false;

    private $countDisliked: number = 0;

    private $displayCompleteProfileMsg: boolean = false;

    constructor() {
    }

    get items(): Item[] {
        return this.$items;
    }

    set items(value: Item[]) {
        this.$items = value;
    }

    get itemUser(): ItemUser {
        return this.$itemUser;
    }

    set itemUser(value: ItemUser) {
        this.$itemUser = value;
    }

    get pageIndex(): number {
        return this.$pageIndex;
    }

    set pageIndex(value: number) {
        this.$pageIndex = value;
    }

    get searchDisliked(): boolean {
        return this.$searchDisliked;
    }

    set searchDisliked(value: boolean) {
        this.$searchDisliked = value;
    }

    get countDisliked(): number {
        return this.$countDisliked;
    }

    set countDisliked(value: number) {
        this.$countDisliked = value;
    }

    get displayCompleteProfileMsg(): boolean {
        return this.$displayCompleteProfileMsg;
    }

    set displayCompleteProfileMsg(value: boolean) {
        this.$displayCompleteProfileMsg = value;
    }

    hasItems(): boolean {
        return !Comparator.isEmpty(this.$items);
    }

    removeItem() {
        if (this.hasItems()) {
            this.$items.pop();
            this.$itemUser = null;
        }
    }

    reset() {
        this.$items = null;
        this.$itemUser = null;
    }
}

