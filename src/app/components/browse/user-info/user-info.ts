import {Component, EventEmitter, Input, Output} from '@angular/core';

// Pages
import {AbstractPage} from '../../../pages/abstract-page';

@Component({
    templateUrl: 'user-info.html',
    styleUrls: ['./user-info.scss'],
    selector: 'app-user-info'
})
export class UserInfoComponent extends AbstractPage {

    @Input() displaySuperstar: boolean;

    @Output() notifiyClose: EventEmitter<boolean> = new EventEmitter<boolean>();

    fadeMsg: boolean = false;

    constructor() {
        super();
    }

    closeMsg($event?: any) {
        if ($event != null) {
            $event.preventDefault();
            $event.stopPropagation();
        }

        this.notifiyClose.emit(true);
    }

    doFadeMsg() {
        setTimeout(() => {
            this.fadeMsg = true;

            setTimeout(() => {
                this.closeMsg();
            }, this.RESOURCES.TIME_OUT.NOTIFICATION.FADE_OUT);
        }, this.RESOURCES.TIME_OUT.NOTIFICATION.DISPLAY_FIRST_MSG);
    }

}
