import {LoadingController, NavController, Platform, ToastController} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {TranslateService} from '@ngx-translate/core';

// Pages
import {AbstractPage} from '../../abstract-page';

// Model
import {AdsService} from '../../../services/advertise/ads-service';
import {Applicant} from '../../../services/model/appointment/applicant';

// Utils
import {Comparator} from '../../../services/core/utils/utils';
import {Item} from '../../../services/model/item/item';

// Services
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {NewItemService} from '../../../services/advertise/new-item-service';
import {LocalFilesService} from '../../../services/native/localfiles/local-files-service';
import {CandidatesService} from '../../../services/advertise/candidates-service';
import {NavParamsService} from '../../../services/core/navigation/nav-params-service';

export abstract class AbstractAdsPage extends AbstractPage {

    item: Item;

    starredCandidates: string[];

    constructor(protected platform: Platform,
                protected loadingController: LoadingController,
                protected navController: NavController,
                protected toastController: ToastController,
                protected translateService: TranslateService,
                protected googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                protected adsService: AdsService,
                protected newItemService: NewItemService,
                protected localFilesService: LocalFilesService,
                protected candidatesService: CandidatesService,
                protected navParamsService: NavParamsService) {
        super();
    }

    hasItem(): boolean {
        return !Comparator.isEmpty(this.item);
    }

    navigateNewItem(backToPageUrl: string) {
        this.showPopupPageChange().then((loading: HTMLIonLoadingElement) => {
            this.newItemService.init();

            this.navigateToWizard(loading, backToPageUrl);
        });
    }

    protected async showPopupPageChange(): Promise<HTMLIonLoadingElement> {
        return new Promise<HTMLIonLoadingElement>(async (resolve) => {
            const loading: HTMLIonLoadingElement = await this.loadingController.create({});

            loading.present().then(() => {
                resolve(loading);
            });
        });
    }

    protected navigateToWizard(loading: HTMLIonLoadingElement, backToPageUrl: string) {
        this.navParamsService.setNewAdNavParams({backToPageUrl: backToPageUrl});

        if (this.platform.is('cordova')) {
            this.localFilesService.removeDir().then(() => {
                this.navController.navigateForward('/new-ad').then(async () => {
                    await loading.dismiss();
                }, async (err: any) => {
                    await loading.dismiss();
                });
            }, (err: any) => {
                // We could live if the directory and tmp files weren't deleted
                this.navController.navigateForward('/new-ad').then(async () => {
                    await loading.dismiss();
                }, async (error: any) => {
                    await loading.dismiss();
                });
            });
        } else {
            this.navController.navigateForward('/new-ad').then(async () => {
                await loading.dismiss();
            }, async (err: any) => {
                await loading.dismiss();
            });
        }
    }

    isApplicantStarred(applicant: Applicant): boolean {
        return Comparator.hasElements(this.starredCandidates) && this.starredCandidates.indexOf(applicant.user._id) > -1;
    }

    protected findStarredCandidates(): Promise<{}> {
        return new Promise((resolve) => {
            this.candidatesService.findStars(this.item._id).then((results: string[]) => {
                this.starredCandidates = results;
                resolve();
            }, (errorResponse: HttpErrorResponse) => {
                this.starredCandidates = new Array();
                resolve();
            });
        });
    }

    protected async navigateToAdminLimitation() {
        await this.navController.navigateForward('/admin-limitation');
    }
}
