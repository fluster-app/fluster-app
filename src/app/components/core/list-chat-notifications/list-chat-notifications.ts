import {Component, AfterViewInit, OnDestroy, Input} from '@angular/core';

// Abstract directive
import {AbstractNoficationComponent} from '../abstract-chat-notification';

// Model
import {User} from '../../../services/model/user/user';

// Services
import {ChatWatcherService} from '../../../services/core/notification/chat-watcher-service';

@Component({
    templateUrl: 'list-chat-notifications.html',
    selector: 'app-list-chat-notifications',
    styleUrls: ['./list-chat-notifications.scss']
})
export class ListChatNotificationsComponent extends AbstractNoficationComponent implements AfterViewInit, OnDestroy {

    @Input() user: User;

    @Input() displayDate: boolean = true;

    constructor(protected chatWatcherService: ChatWatcherService) {
        super(chatWatcherService);
    }

    ngAfterViewInit() {
        this.afterViewInit().then(() => {
            // Do nothing
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
