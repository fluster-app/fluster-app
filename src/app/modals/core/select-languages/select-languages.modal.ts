import {Component, OnInit} from '@angular/core';
import {ModalController, NavParams, Platform} from '@ionic/angular';

// Abstract
import {AbstractWizardModal} from '../abstract-wizard-modal';

// Resources and utils
import {Comparator} from '../../../services/core/utils/utils';

// Service
import {LanguagesService, Language} from '../../../services/core/languages/languages-service';

// Modal
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';

export interface LanguageSelector {
    language: Language;
    selected: boolean;
}

@Component({
    templateUrl: './select-languages.modal.html',
    selector: 'app-select-languages'
})
export class SelectLanguagesModal extends AbstractWizardModal implements OnInit {

    allLanguages: LanguageSelector[] = null;
    languages: LanguageSelector[] = null;

    userLanguages: string[];

    private pageIndex: number = 1;
    private lastPageReached: boolean = false;

    constructor(protected platform: Platform,
                private navParams: NavParams,
                private modalController: ModalController,
                private languagesService: LanguagesService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(platform);

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.SELECT_LANGUAGES);
    }

    ngOnInit() {
        this.checkAdDisplayParams(this.navParams);
    }

    ionViewWillEnter() {
        this.userLanguages = this.navParams.get('userLanguages');

        this.languagesService.loadLanguages().then((result: Language[]) => {
            this.loadLanguagesSelector(result).then((selected: LanguageSelector[]) => {
                this.allLanguages = selected;
                this.loadNextLanguages().then(() => {
                    // Do nothing
                });
            });
        }, (err: any) => {
            this.allLanguages = new Array();
            this.languages = new Array();
        });
    }

    private loadLanguagesSelector(allCodes: Language[]): Promise<{}> {
        return new Promise((resolve) => {
            const selected: LanguageSelector[] = new Array();

            for (let i: number = 0; i < allCodes.length; i++) {
                selected.push({
                    language: allCodes[i],
                    selected: Comparator.hasElements(this.userLanguages) && this.userLanguages.indexOf(allCodes[i].code) > -1
                });
            }

            resolve(selected);
        });
    }

    selectLang(selector: LanguageSelector) {

        if (this.userLanguages == null) {
            this.userLanguages = new Array();
        }

        if (this.userLanguages.indexOf(selector.language.code) > -1) {
            this.userLanguages.splice(this.userLanguages.indexOf(selector.language.code), 1);
        } else {
            this.userLanguages.push(selector.language.code);
        }
    }

    search(ev: any) {
        const val: string = ev.target.value;

        if (!Comparator.isStringEmpty(val)) {
            this.languages = this.allLanguages.filter((lang: LanguageSelector) => {
                return lang.language.name.toLowerCase().includes(val.toLowerCase()) || lang.language.nativeName.toLowerCase().includes(val.toLowerCase());
            });
        } else {
            this.loadNextLanguages().then(() => {
                // Do nothing
            });
        }
    }

    close() {
        this.modalController.dismiss(this.userLanguages).then(() => {
            // Do nothing
        });
    }

    isLastPageReached(): boolean {
        return this.lastPageReached;
    }

    private loadNextLanguages(): Promise<{}> {
        return new Promise((resolve) => {
            if (Comparator.hasElements(this.allLanguages) && !this.isLastPageReached()) {
                this.languages = this.allLanguages.slice(0, this.pageIndex * this.RESOURCES.API.PAGINATION.LANGUAGES);
                this.pageIndex++;

                if (Comparator.isEmpty(this.languages) || this.languages.length >= this.allLanguages.length) {
                    this.lastPageReached = true;
                }
            }

            resolve();
        });
    }

    // TODO: Define a type for event
    // https://forum.ionicframework.com/t/v4-infinitescroll-event-type-definition
    nextLanguages(event) {
        this.loadNextLanguages().then(() => {
            event.target.complete();
        });
    }

}
