import {Component, EventEmitter, Output} from '@angular/core';

// Pages
import {AbstractPage} from '../../../pages/abstract-page';

@Component({
    templateUrl: 'no-ads.html',
    selector: 'app-no-ads'
})
export class NoAdsComponent extends AbstractPage {

    @Output() notifyNavigateNewItem: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() {
        super();
    }

    navigateNewItem() {
        this.notifyNavigateNewItem.emit(true);
    }
}
