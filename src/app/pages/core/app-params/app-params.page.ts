import {Component, Input, OnInit} from '@angular/core';
import {ActionSheetController, App, LoadingController, MenuController, NavController, Platform, ToastController} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {forkJoin} from 'rxjs';

import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';

import {TranslateService} from '@ngx-translate/core';

// Pages
import {AbstractPage} from '../../abstract-page';

// Model
import {User} from '../../../services/model/user/user';

// Resources and utils
import {Comparator, Converter} from '../../../services/core/utils/utils';

// Services
import {AuthenticationService} from '../../../services/core/authentication/authentication-service';
import {UserSessionService} from '../../../services/core/user/user-session-service';
import {UserProfileService} from '../../../services/core/user/user-profile-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {AccessTokenService} from '../../../services/core/user/access-token-service';
import {FacebookNativeService} from '../../../services/native/facebook/facebook-native-service';
import {GoogleNativeService} from '../../../services/native/google/google-native-service';

@Component({
    selector: 'app-app-params',
    templateUrl: './app-params.page.html',
    styleUrls: ['./app-params.page.scss'],
})
export class AppParamsPage extends AbstractPage implements OnInit {

    @Input() user: User;

    private originalUser: User;

    logoutInProgress: boolean = false;
    deleteInProgress: boolean = false;

    constructor(private platform: Platform,
                private app: App,
                private menuController: MenuController,
                private toastController: ToastController,
                private loadingController: LoadingController,
                private navController: NavController,
                private inAppBrowser: InAppBrowser,
                private facebookNativeService: FacebookNativeService,
                private googleNativeService: GoogleNativeService,
                private socialSharing: SocialSharing,
                private translateService: TranslateService,
                private actionSheetController: ActionSheetController,
                private authenticationService: AuthenticationService,
                private userSessionService: UserSessionService,
                private userProfileService: UserProfileService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private accessTokenService: AccessTokenService) {
        super();

        this.logoutInProgress = false;
        this.deleteInProgress = false;

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.APP_PARAMS);
    }

    ngOnInit() {
        this.user = this.userSessionService.getUser();

        // #320: No migration, consider null as superstars allowed
        if (this.user.userParams.appSettings.browsing && this.user.userParams.appSettings.allowSuperstars == null) {
            this.user.userParams.appSettings.allowSuperstars = true;
        }

        this.originalUser = JSON.parse(JSON.stringify(this.user));

        this.menuController.close('menuBrowse');
        this.menuController.close('menuAdvertise');
    }

    ionViewWillLeave() {

        if (this.user != null && !Comparator.equals(this.originalUser, this.user)) {
            // Will allow us to detect the modification to update the user
            this.userSessionService.setUserToSave(this.user);
        }
    }

    async ionViewDidLeave() {
        await this.saveUserIfNeeded(this.toastController, this.loadingController, this.translateService, this.userProfileService, this.userSessionService, this.user);
    }

    showLogOutActionSheet() {
        this.showActionSheet(false);
    }

    showDeleteActionSheet() {
        this.showActionSheet(true);
    }

    private showActionSheet(deleteAccount: boolean) {
        const promises = new Array();

        promises.push(this.translateService.get(deleteAccount ? 'APP_PARAMS.DELETE_ACCOUNT.QUESTION' : 'APP_PARAMS.LOGOUT.QUESTION'));
        promises.push(this.translateService.get(deleteAccount ? 'APP_PARAMS.DELETE_ACCOUNT.DELETE' : 'APP_PARAMS.LOGOUT.LOGOUT'));
        promises.push(this.translateService.get('CORE.CANCEL'));

        forkJoin(promises).subscribe(
            async (data: string[]) => {
                const actionSheet: HTMLIonActionSheetElement = await this.actionSheetController.create({
                    header: data[0],
                    buttons: [
                        {
                            text: data[1],
                            role: 'destructive',
                            handler: () => {
                                if (deleteAccount) {
                                    this.deleteAccountAndLogout();
                                } else {
                                    this.logout();
                                }
                            }
                        }, {
                            text: data[2],
                            role: 'cancel',
                            handler: () => {
                                // Do nothing
                            }
                        }
                    ]
                });

                actionSheet.present();
            }
        );
    }

    private deleteAccountAndLogout() {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.LOGOUT, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.DELETE_ACCOUNT);

        this.deleteInProgress = true;

        this.user.facebook = undefined;
        this.user.updatedAt = new Date();

        this.userProfileService.anonymize(this.user).then((succcess: Communication.AnonymizeUser) => {
            this.doLogout(true);
        }, async (response: HttpErrorResponse) => {
            await this.errorMsg(this.toastController, this.translateService, 'ERRORS.USER.SAVE_ERROR');
        });
    }

    private logout() {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.LOGOUT, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.LOGOUT);

        this.logoutInProgress = true;

        this.doLogout(false);
    }

    private doLogout(deleteAccount: boolean) {

        const promise = this.accessTokenService.accessToken.googleAuth ? this.googleNativeService.logout() : this.facebookNativeService.logout();

        promise.then((success) => {
            this.peterparkerLogout(deleteAccount);
        }, (errorResponse) => {
            // Logout from serve anyway
            this.peterparkerLogout(deleteAccount);
        });
    }

    private peterparkerLogout(deleteAccount: boolean) {

        const status: string = deleteAccount ? this.RESOURCES.USER.STATUS.DELETED : this.RESOURCES.USER.STATUS.CLOSE;

        this.authenticationService.logout(status).then(() => {
            this.user = null;

            this.navController.navigateRoot('/login').then(() => {
                // Do noting
            });
        });
    }

    shareFluster() {
        const promises = new Array();
        promises.push(this.translateService.get('APP_PARAMS.SHARE.SHARE_SUBJECT'));
        promises.push(this.translateService.get('APP_PARAMS.SHARE.SHARE_CONTENT'));

        forkJoin(promises).subscribe(
            (data: string[]) => {
                const sharedUrl: string = this.RESOURCES.SOCIAL_SHARING.FLUSTER_WEBSITE;
                const sharedImgUrl: string = Converter.getFlusterShareImgURL(true);

                this.share(this.socialSharing, data[1], data[0], sharedImgUrl, sharedUrl).then((result: boolean) => {
                    // Do nothing
                }, (errorMsg: string) => {
                    // Do nothing
                });
            }
        );
    }

    openTermsOfuser() {
        this.displayTermsOfuser(this.inAppBrowser);
    }

    openGithub() {
        this.inAppBrowser.create(this.RESOURCES.GITHUB.URL, '_blank', 'location=no');
    }

}
