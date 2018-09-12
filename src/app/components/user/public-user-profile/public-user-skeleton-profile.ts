import {Component, Input} from '@angular/core';
import {User} from '../../../services/model/user/user';

@Component({
    templateUrl: 'public-user-skeleton-profile.html',
    styleUrls: ['./public-user-skeleton-profile.scss'],
    selector: 'app-public-user-skeleton-profile'
})
export class PublicUserSkeletonProfileComponent {

    @Input() user: User;

}
