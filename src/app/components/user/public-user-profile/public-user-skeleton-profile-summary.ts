import {Component, Input} from '@angular/core';

// Model
import {User} from '../../../services/model/user/user';

@Component({
    templateUrl: 'public-user-skeleton-profile-summary.html',
    styleUrls: ['./public-user-skeleton-profile-summary.scss'],
    selector: 'app-public-user-skeleton-profile-summary'
})
export class PublicUserSkeletonProfileSummaryComponent {

    @Input() user: User;

}
