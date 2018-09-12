import {Component, AfterViewInit, Input} from '@angular/core';
import {NavController} from '@ionic/angular';

// Model
import {User} from '../../../services/model/user/user';

// Service
import {UserSessionService} from '../../../services/core/user/user-session-service';

@Component({
    templateUrl: 'menu-header.html',
    styleUrls: ['./menu-header.scss'],
    selector: 'app-menu-header'
})
export class MenuHeaderComponent implements AfterViewInit {

    @Input() user: User;

    constructor(private navController: NavController,
                private userSessionService: UserSessionService) {
        this.user = this.userSessionService.getUser();
    }

    ngAfterViewInit(): void {
    }

    userProfile() {
        // Importing the navController result in an error while running, that's why here we go thru the app
        this.navController.navigateForward('/user-profile');
    }

}
