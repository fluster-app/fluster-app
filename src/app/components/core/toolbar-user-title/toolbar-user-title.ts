import {Component, Input} from '@angular/core';

// Model
import {UserFacebook, UserGoogle} from '../../../services/model/user/user';

@Component({
    templateUrl: 'toolbar-user-title.html',
    styleUrls: ['./toolbar-user-title.scss'],
    selector: 'app-toolbar-user-title'
})
export class ToolbarUserTitleComponent {

    @Input() facebook: UserFacebook;

    @Input() google: UserGoogle;

    @Input() display: boolean = false;
}
