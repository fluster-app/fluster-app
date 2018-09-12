import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {ModalController, NavParams, Platform} from '@ionic/angular';

import {debounceTime} from 'rxjs/operators';

// Abstract
import {AbstractModal} from '../abstract-modal';

// Model
import {User} from '../../../services/model/user/user';
import WorkSchool = Communication.WorkSchool;

// Utils
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {UserSessionService} from '../../../services/core/user/user-session-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {WorkSchoolService} from '../../../services/core/work-school/work-school-service';

@Component({
    templateUrl: 'select-work-school.html',
    selector: 'app-select-work-school'
})
export class SelectWorkSchoolModal extends AbstractModal {

    user: User;

    current: string;

    modeWork: boolean; // true = work, false = school

    results: WorkSchool[] = new Array();

    searchTerm: string = '';
    searchControl: FormControl;
    searching: boolean = false;

    hasFullWorkMatch: boolean = false;

    constructor(protected platform: Platform,
                private modalController: ModalController,
                private navParams: NavParams,
                private userSessionService: UserSessionService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private workSchoolService: WorkSchoolService) {
        super();

        this.searchControl = new FormControl();

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.SEARCH_WORK_SCHOOL);
    }

    ionViewWillEnter() {
        this.user = this.userSessionService.getUser();

        this.current = this.navParams.get('current');

        this.modeWork = this.navParams.get('modeWork');

        this.bindSearch();
    }

    onSearchInput() {
        this.searching = true;
    }

    private bindSearch() {
        this.searchControl.valueChanges
            .pipe(
                debounceTime(700)
            )
            .subscribe((search: string) => {
                this.searchTerm = search;
                this.search();
            });
    }

    selectAndNavigate(result: string) {
        this.modalController.dismiss(!Comparator.isStringEmpty(result) ? result : null).then(() => {
            // Do nothing
        });
    }

    close() {
        this.modalController.dismiss(this.current).then(() => {
            // Do nothing
        });
    }

    private search() {
        if (Comparator.isStringEmpty(this.searchTerm)) {
            this.searching = false;
            this.results = new Array();
            this.hasFullWorkMatch = false;
            return;
        }

        this.findService().then((response: WorkSchool[]) => {
            this.searching = false;
            this.results = response;

            this.fullWorkMatch().then((result: boolean) => {
                this.hasFullWorkMatch = result;
            });
        }, (response: HttpErrorResponse) => {
            this.searching = false;
            this.results = new Array();
            this.hasFullWorkMatch = false;
        });
    }

    private findService(): Promise<{}> {
        if (this.modeWork) {
            return this.workSchoolService.findEmployers(this.searchTerm);
        } else {
            return this.workSchoolService.findEducations(this.searchTerm);
        }
    }

    hasCurrent(): boolean {
        return !Comparator.isStringEmpty(this.current);
    }

    hasResults(): boolean {
        return Comparator.hasElements(this.results);
    }

    private fullWorkMatch(): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.modeWork || Comparator.isStringEmpty(this.searchTerm)) {
                resolve(false);
            } else if (Comparator.hasElements(this.results)) {
                resolve(this.findFullWorkMatch());
            } else {
                resolve(false);
            }
        });
    }

    private findFullWorkMatch(): boolean {
        for (let i: number = 0; i < this.results.length; i++) {
            const workSchool: WorkSchool = this.results[i];

            if (!Comparator.isEmpty(workSchool._id) && !Comparator.isStringEmpty(workSchool._id.employer) && this.searchTerm.toLowerCase().indexOf(workSchool._id.employer.toLowerCase()) > -1) {
                return true;
            }
        }

        return false;
    }
}
