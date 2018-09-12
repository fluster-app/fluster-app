import {Component, Input} from '@angular/core';

// Model
import {UserFacebook, UserGoogle} from '../../../services/model/user/user';

@Component({
    templateUrl: 'user-profile-img-list.html',
    selector: 'app-user-profile-img-list'
})
export class UserProfileImgListComponent {

    @Input() facebook: UserFacebook;

    @Input() google: UserGoogle;

    @Input() starred: boolean = false;
}
