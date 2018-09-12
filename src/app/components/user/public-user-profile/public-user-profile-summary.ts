import {Component, Input} from '@angular/core';

// Model
import {User} from '../../../services/model/user/user';

// Utils
import {Resources} from '../../../services/core/utils/resources';

// Service
import {SubscriptionService} from '../../../services/core/user/subscription-service';

@Component({
    templateUrl: 'public-user-profile-summary.html',
    styleUrls: ['./public-user-profile-summary.scss'],
    selector: 'app-public-user-profile-summary'
})
export class PublicUserProfileSummaryComponent {

    RESOURCES: any = Resources.Constants;

    @Input() user: User;

    @Input() displaySensitive: boolean = false;

    @Input() displaySubscription: boolean = false;

    @Input() displayStarred: boolean = false;

    @Input() displayLocation: boolean = true;

    constructor(private subscriptionService: SubscriptionService) {

    }

    isSubscriptionActive(): boolean {
        return this.displaySubscription && this.subscriptionService.isSubscriptionActive();
    }
}
