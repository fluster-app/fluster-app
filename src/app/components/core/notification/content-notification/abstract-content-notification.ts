import {Subscription} from 'rxjs';

// Pages
import {AbstractPage} from '../../../../pages/abstract-page';

// Model
import {Notification} from '../../../../services/model/notification/notification';

// Utils
import {Comparator} from '../../../../services/core/utils/utils';

export abstract class AbstractContentNotification extends AbstractPage {

    newNotifications: Notification[];

    notifierSubscription: Subscription;

    displayOnInit: boolean = false;

    displayNotifications: boolean = false;
    fadeClose: boolean = false;

    constructor() {
        super();
    }

    protected displayNewNotifications() {
        if (!Comparator.isEmpty(this.newNotifications) && !this.displayNotifications) {
            Promise.resolve(null).then(() => this.displayNotifications = true);

            setTimeout(() => {
                this.fadeClose = true;

                setTimeout(() => {
                    this.close();
                }, this.RESOURCES.TIME_OUT.NOTIFICATION.FADE_OUT);
            }, this.RESOURCES.TIME_OUT.NOTIFICATION.DISPLAY);
        }
    }

    protected close() {
        this.newNotifications = new Array();
        this.displayNotifications = false;
        this.fadeClose = false;
    }

    closeMsg() {
        this.close();
    }

    hasManyNewNotifications(): boolean {
        return !Comparator.isEmpty(this.newNotifications) && this.newNotifications.length > -1;
    }

    hasMoreThanOneNotifications(): boolean {
        return !Comparator.isEmpty(this.newNotifications) && this.newNotifications.length > 1;
    }

    hasSingleNewNotifications(): boolean {
        return !Comparator.isEmpty(this.newNotifications) && this.newNotifications.length === 1;
    }
}
