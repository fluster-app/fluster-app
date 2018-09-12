import {Component} from '@angular/core';
import {NavController} from '@ionic/angular';

@Component({
    templateUrl: 'menu-footer.html',
    styleUrls: ['./menu-footer.scss'],
    selector: 'app-menu-footer'
})
export class MenuFooterComponent {

    constructor(private navController: NavController) {
    }

    appParams() {
        this.navController.navigateForward('/app-params');
    }

}
