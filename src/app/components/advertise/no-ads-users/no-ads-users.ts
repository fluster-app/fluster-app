import {Component, EventEmitter, Input, Output} from '@angular/core';

// Model
import {User} from '../../../services/model/user/user';

// Services
import {UserSessionService} from '../../../services/core/user/user-session-service';

@Component({
    templateUrl: 'no-ads-users.html',
    selector: 'app-no-ads-users',
    styleUrls: ['./no-ads-users.scss']
})
export class NoAdsUsersComponent {

    @Input() label: string;

    @Input() totalAdvertiseNotifications: number = 0;

    @Output() notifyNavigateApplicants: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output() notifyNavigateCandidates: EventEmitter<boolean> = new EventEmitter<boolean>();

    user: User;

    constructor(private userSessionService: UserSessionService) {
        this.user = this.userSessionService.getUser();
    }

    navigate() {
        if (this.totalAdvertiseNotifications > 0) {
            this.notifyNavigateApplicants.emit(true);
        } else if (this.totalAdvertiseNotifications <= 0) {
            this.notifyNavigateCandidates.emit(true);
        }
    }

}
