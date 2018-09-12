import {Component, Input, AfterViewInit, OnDestroy, Output, EventEmitter} from '@angular/core';

// Model
import {Notification} from '../../../../services/model/notification/notification';

// Abstract
import {AbstractContentNotification} from './abstract-content-notification';

// Utils
import {Comparator} from '../../../../services/core/utils/utils';

// Services
import {NotificationWatcherService} from '../../../../services/core/notification/notification-watcher-service';

@Component({
    templateUrl: 'content-advertise-notification.html',
    selector: 'app-content-advertise-notification'
})
export class ContentAdvertiseNotificationComponent extends AbstractContentNotification implements AfterViewInit, OnDestroy {

    @Input() displayOnInit: boolean = false;

    @Output() notifyNewNotifications: EventEmitter<{}> = new EventEmitter<{}>();

    constructor(private notificationWatcherService: NotificationWatcherService) {
        super();

        this.newNotifications = this.notificationWatcherService.getAdvertiseNewNotifications();

        this.notifierSubscription = this.notificationWatcherService.newAdvertiseNotification
            .subscribe(async (newAdvertiseNotifications: Notification[]) => await this.processNewNotifications(newAdvertiseNotifications));

    }

    async ngAfterViewInit() {
        if (this.displayOnInit) {
            await this.processNotifications(true);
        }
    }

    ngOnDestroy(): void {
        if (this.notifierSubscription != null) {
            this.notifierSubscription.unsubscribe();
        }
    }

    private async processNewNotifications(newNotifications: Notification[]) {
        this.newNotifications = newNotifications;
        await this.processNotifications(false);
    }

    private processNotifications(afterViewInit: boolean): Promise<void> {
        return new Promise((resolve) => {
            this.markNotificationsAsRead();
            this.displayNewNotifications();

            if (!afterViewInit && Comparator.hasElements(this.newNotifications)) {
                this.notifyNewNotifications.emit();
            }

            resolve();
        });
    }

    private markNotificationsAsRead() {
        this.notificationWatcherService.markAllAdvertiseNotificationsRead(false).then(() => {
            // Do nothing
        });
    }

}
