import {Component} from '@angular/core';
import {LoadingController, MenuController, NavController, Platform, ToastController} from '@ionic/angular';

import {SplashScreen} from '@ionic-native/splash-screen/ngx';

import {TranslateService} from '@ngx-translate/core';

// Page
import {MyItemsPage} from '../abstract-my-items';

// Model
import {User} from '../../../../services/model/user/user';
import {Item} from '../../../../services/model/item/item';

// Services
import {ItemsService} from '../../../../services/browse/items-service';
import {ItemUsersService} from '../../../../services/browse/item-users-service';
import {NotificationWatcherService} from '../../../../services/core/notification/notification-watcher-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {UserProfileService} from '../../../../services/core/user/user-profile-service';
import {UserSessionService} from '../../../../services/core/user/user-session-service';
import {LoginService} from '../../../../services/core/login/login-service';
import {NavParamsService} from '../../../../services/core/navigation/nav-params-service';

@Component({
    selector: 'app-my-appointments-items',
    templateUrl: './my-appointments-items.page.html',
    styleUrls: ['./my-appointments-items.page.scss'],
})
export class MyAppointmentsItemsPage extends MyItemsPage {

    constructor(protected navController: NavController,
                protected platform: Platform,
                private toastController: ToastController,
                private loadingController: LoadingController,
                private menuController: MenuController,
                private splashScreen: SplashScreen,
                private loginService: LoginService,
                protected translateService: TranslateService,
                protected itemUsersService: ItemUsersService,
                private itemsService: ItemsService,
                protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                protected notificationWatcherService: NotificationWatcherService,
                private userProfileService: UserProfileService,
                private userSessionService: UserSessionService,
                protected navParamsService: NavParamsService) {
        super(platform, navController, translateService, itemUsersService, googleAnalyticsNativeService, notificationWatcherService, navParamsService);

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ITEMS.MY_APPOINTMENTS);
    }

    async ionViewWillEnter() {
        super.init();

        this.hideSplashScreen(this.platform, this.splashScreen, this.loginService);

        await this.enableMenu(this.menuController, true, false);
    }

    async doSaveUserIfNeeded() {
        const user: User = this.userSessionService.getUser();
        await this.saveUserIfNeeded(this.toastController, this.loadingController, this.translateService, this.userProfileService, this.userSessionService, user);
    }

    ionViewWillLeave() {
        this.notificationWatcherService.resetBrowseNotifications();
    }

    protected findMyItems(pageIndex: number): Promise<{}> {
        return this.itemsService.findMyAppointmentsItems(this.pageIndex, false);
    }

    protected findItemNotificationRead(items: Item[]): Promise<{}> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    protected removeItemFromListFunction = (): Promise<{}> => {
        return new Promise((resolve) => {
            resolve();
        });
    };

    protected checkSubscriptionViewApplicants() {
        // Do nothing
    }

}
