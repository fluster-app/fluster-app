import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DeepLinkingService {

    itemHashId: string;

    setItemHashId(itemId: string) {
        this.itemHashId = itemId;
    }

    getItemHashId(): string {
        return this.itemHashId;
    }

    reset() {
        this.itemHashId = null;
    }
}
