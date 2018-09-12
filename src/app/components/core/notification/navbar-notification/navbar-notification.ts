import {Component, AfterViewInit, Input, OnDestroy} from '@angular/core';

import {Subscription} from 'rxjs';

// Abstract
import {AbstractNoficationComponent} from '../../abstract-chat-notification';

// Model
import {Notification} from '../../../../services/model/notification/notification';

// Service
import {NotificationWatcherService} from '../../../../services/core/notification/notification-watcher-service';
import {ChatWatcherService} from '../../../../services/core/notification/chat-watcher-service';
import {Comparator} from '../../../../services/core/utils/utils';

@Component({
    templateUrl: 'navbar-notification.html',
    styleUrls: ['./navbar-notification.scss'],
    selector: 'app-navbar-notification'
})
export class NavbarNotificationComponent extends AbstractNoficationComponent implements AfterViewInit, OnDestroy {

    @Input() browse: boolean = false;
    @Input() ad: boolean = false;

    // True = in menu / False in Toolbar
    @Input() displayInMenu: boolean = false;

    @Input() displayChatNotification: boolean = true;

    @Input() displayOnlyNewNotification: boolean = false;

    newAdvertiseNotification: boolean = false;
    newBrowseNotification: boolean = false;

    private newAdvertiseNotificationSubscription: Subscription;
    private newBrowseNotificationSubscription: Subscription;

    constructor(private notificationWatcherService: NotificationWatcherService,
                protected chatWatcherService: ChatWatcherService) {
        super(chatWatcherService);

        // All chat notifications
        this.allUser = true;

        this.hasNewAdvertiseNotification();
        this.hasNewBrowseNotification();

        this.newAdvertiseNotificationSubscription = this.notificationWatcherService.newAdvertiseNotification
            .subscribe((newAdvertiseNotifications: Notification[]) => {
            this.hasNewAdvertiseNotification();
        });

        this.newBrowseNotificationSubscription = this.notificationWatcherService.newBrowseNotification
            .subscribe((newBrowseNotifications: Notification[]) => {
            this.hasNewBrowseNotification();
        });

    }

    ngAfterViewInit(): void {
        this.afterViewInit().then(() => {
            // Do nothing
        });
    }

    ngOnDestroy() {
        this.unsubscribe();

        if (this.newAdvertiseNotificationSubscription != null) {
            this.newAdvertiseNotificationSubscription.unsubscribe();
        }

        if (this.newBrowseNotificationSubscription != null) {
            this.newBrowseNotificationSubscription.unsubscribe();
        }

    }

    private hasNewAdvertiseNotification() {
        this.newAdvertiseNotification = Comparator.hasElements(this.notificationWatcherService.getAdvertiseNewNotifications());
    }

    private hasNewBrowseNotification() {
        this.newBrowseNotification = Comparator.hasElements(this.notificationWatcherService.getBrowseNewNotifications());
    }

    displayBrowseMenuNotification(): boolean {
        return this.browse && this.displayInMenu && (!this.displayOnlyNewNotification || this.hasBrowseNotification());
    }

    hasBrowseNotification(): boolean {
        return this.newBrowseNotification || (this.notified && this.displayChatNotification);
    }

    displayAdMenuNotification(): boolean {
        return this.ad && this.displayInMenu && (!this.displayOnlyNewNotification || this.hasAdNotification());
    }

    hasAdNotification(): boolean {
        return this.newAdvertiseNotification || (this.notified && this.displayChatNotification);
    }
}
