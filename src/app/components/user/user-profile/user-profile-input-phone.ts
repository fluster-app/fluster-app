import {Component, Input} from '@angular/core';

// Model
import {User} from '../../../services/model/user/user';

@Component({
    templateUrl: 'user-profile-input-phone.html',
    styleUrls: ['./user-profile-input-phone.scss'],
    selector: 'app-user-profile-input-phone'
})
export class UserProfileInputPhoneComponent {

    @Input() user: User;

    constructor() {
    }

}
