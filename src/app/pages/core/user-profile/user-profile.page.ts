import {Component, Input, ViewChild} from '@angular/core';
import {Content, LoadingController, MenuController, ModalController, Platform, ToastController} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';
import {HttpErrorResponse} from '@angular/common/http';

import {TranslateService} from '@ngx-translate/core';

// Pages
import {AbstractPage} from '../../abstract-page';

// Modal
import {SelectLanguagesModal} from '../../../modals/core/select-languages/select-languages.modal';
import {SelectWorkSchoolModal} from '../../../modals/core/select-work-school/select-work-school';

// Model
import {User, UserDescription, UserDescriptionSpotify} from '../../../services/model/user/user';

// Resources and utils
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {UserSessionService} from '../../../services/core/user/user-session-service';
import {Language, LanguagesService} from '../../../services/core/languages/languages-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {UserProfileService} from '../../../services/core/user/user-profile-service';
import {StorageService} from '../../../services/core/localstorage/storage-service';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.page.html',
    styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage extends AbstractPage {

    @ViewChild(Content) content: Content;

    @Input() user: User;

    private originalUser: User;

    languages: string;

    constructor(private platform: Platform,
                private menuController: MenuController,
                private modalController: ModalController,
                private loadingController: LoadingController,
                private toastController: ToastController,
                private translateService: TranslateService,
                private userProfileService: UserProfileService,
                private userSessionService: UserSessionService,
                private languagesService: LanguagesService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private storageService: StorageService) {
        super();

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.USER_PROFILE);
    }

    ionViewWillEnter() {
        this.user = this.userSessionService.getUser();

        this.setOriginalUser();

        this.menuController.close('menuBrowse');
        this.menuController.close('menuAdvertise');

        this.initLanguages();
    }

    private setOriginalUser() {
        this.originalUser = JSON.parse(JSON.stringify(this.user));
    }

    ionViewWillLeave() {
        if (!Comparator.equals(this.originalUser, this.user)) {
            // Will allow us to detect the modification to update the user
            this.userSessionService.setUserToSave(this.user);
        }
    }

    async ionViewDidLeave() {
        await this.saveUserIfNeeded(this.toastController, this.loadingController, this.translateService, this.userProfileService, this.userSessionService, this.user);

        this.saveProfileCompletedOnce();
    }

    private initLanguages() {
        this.loadLanguages().then((result: string) => {
            this.languages = result;
        });
    }

    private loadLanguages(): Promise<string> {
        return new Promise((resolve) => {
            if (this.hasUser() && this.user.description != null && this.user.description.languages != null) {
                this.languagesService.findLanguages(this.user.description.languages).then((results: Language[]) => {
                    let loadedLanguage: string = '';

                    if (!Comparator.isEmpty(results)) {
                        results.forEach((language: Language) => {
                            loadedLanguage += language.nativeName;
                            loadedLanguage += ', ';
                        });

                        if (!Comparator.isStringEmpty(loadedLanguage)) {
                            loadedLanguage = loadedLanguage.slice(0, -1 * ', '.length);
                        }
                    }

                    resolve(loadedLanguage);
                }, (error: Language[]) => {
                    resolve(null);
                });
            } else {
                resolve(null);
            }
        });
    }

    hasLanguages(): boolean {
        return !Comparator.isStringEmpty(this.languages);
    }

    hasUser(): boolean {
        return !Comparator.isEmpty(this.user);
    }

    async navigateToLang() {
        const modal: HTMLIonModalElement = await this.modalController.create({
            component: SelectLanguagesModal,
            componentProps: {
                adDisplay: false,
                userLanguages: this.user.description != null ? this.user.description.languages : null
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            if (this.user.description == null) {
                this.user.description = new UserDescription();
            }

            this.user.description.languages = detail.data;

            this.initLanguages();
        });

        await modal.present();
    }

    hasLikes(): boolean {
        return this.hasUser() && !Comparator.isEmpty(this.user.facebook.likes) && Comparator.hasElements(this.user.facebook.likes.data);
    }

    hasEducation(): boolean {
        return !Comparator.isEmpty(this.user.description) && !Comparator.isStringEmpty(this.user.description.school);
    }

    hasWork(): boolean {
        return !Comparator.isEmpty(this.user.description) && !Comparator.isStringEmpty(this.user.description.employer);
    }

    async navigateToSelectWorkSchool(modeWork: boolean) {
        const modal: HTMLIonModalElement = await this.modalController.create({
            component: SelectWorkSchoolModal,
            componentProps: {
                current: modeWork ? (this.hasWork() ? this.user.description.employer : null) : (this.hasEducation() ? this.user.description.school : null),
                modeWork: modeWork
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            if (this.user.description == null) {
                this.user.description = new UserDescription();
            }

            // true = work, false = school
            if (modeWork) {
                this.user.description.employer = detail.data;
            } else {
                this.user.description.school = detail.data;
            }
        });

        await modal.present();
    }

    updateSpotify(userSpotify: UserDescriptionSpotify) {
        if (!Comparator.isEmpty(userSpotify)) {
            this.user.description.spotify = userSpotify;
            this.userSessionService.setUserToSave(this.user);
            this.saveUser();
        } else {
            this.user.description.spotify = null;
        }
    }

    private async saveUser() {
        const loading: HTMLIonLoadingElement = await this.loadingController.create({});

        loading.present().then(() => {
            this.userProfileService.saveIfModified(this.user).then(async (updatedUser: User) => {
                if (!Comparator.isEmpty(updatedUser)) {
                    this.user = updatedUser;
                    this.setOriginalUser();
                }

                await loading.dismiss();
            }, async (response: HttpErrorResponse) => {
                await loading.dismiss();
                await this.errorMsg(this.toastController, this.translateService, 'ERRORS.USER.SAVE_ERROR');
            });
        });
    }

    hasSpotifyEnabled(): boolean {
        return !Comparator.isEmpty(this.user.description) && !Comparator.isEmpty(this.user.description.spotify) && this.user.description.spotify.display;
    }

    private saveProfileCompletedOnce() {
        if (this.userSessionService.shouldUserBeSaved()) {
            this.storageService.saveProfileCompletedOnce(true).then(() => {
                // Do nothing
            });
        }
    }


}
