import {Component} from '@angular/core';

// Abstract
import {AbstractWizardModal} from '../abstract-wizard-modal';
import {Comparator} from '../../../services/core/utils/utils';

// Model
import {
    SelectHobbiesGroup,
    SelectHobbiesGroupKey,
    SelectHobbiesResult
} from '../../../services/model/utils/hobbies';

// Services
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {ModalController, NavParams, Platform} from '@ionic/angular';

@Component({
    templateUrl: 'select-hobbies.html',
    styleUrls: ['./select-hobbies.scss'],
    selector: 'app-select-hobbies'
})
export class SelectHobbiesModal extends AbstractWizardModal {

    groups: SelectHobbiesGroup[];

    private sports: string[];
    private arts: string[];
    private food: string[];
    private places: string[];

    constructor(protected platform: Platform,
                private modalController: ModalController,
                private navParams: NavParams,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(platform);

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.SELECT_HOBBIES);
    }

    ionViewWillEnter() {
        this.checkAdDisplayParams(this.navParams);

        this.sports = this.navParams.get('sports');
        this.arts = this.navParams.get('arts');
        this.food = this.navParams.get('food');
        this.places = this.navParams.get('places');

        this.loadGroups().then((results: SelectHobbiesGroup[]) => {
            this.groups = results;
        });
    }

    private loadGroups(): Promise<{}> {
        return new Promise((resolve) => {
            const results: SelectHobbiesGroup[] = new Array();

            results.push({titleKey: 'SPORTS', keys: this.loadKeys(this.RESOURCES.USER.HOBBIES.SPORTS, 'SPORTS', this.sports)});
            results.push({titleKey: 'ARTS', keys: this.loadKeys(this.RESOURCES.USER.HOBBIES.ARTS, 'ARTS', this.arts)});
            results.push({titleKey: 'FOOD', keys: this.loadKeys(this.RESOURCES.USER.HOBBIES.FOOD, 'FOOD', this.food)});
            results.push({titleKey: 'PLACES', keys: this.loadKeys(this.RESOURCES.USER.HOBBIES.PLACES, 'PLACES', this.places)});

            resolve(results);
        });
    }

    private loadKeys(keys: string[], group: string, currentValues: string[]): SelectHobbiesGroupKey[] {
        const results: SelectHobbiesGroupKey[] = new Array();

        keys.forEach((key: string) => {
            results.push({
                key: key,
                keyTranslation: 'USER_PROFILE.HOBBIES.' + group + '.' + key.toUpperCase(),
                selected: Comparator.hasElements(currentValues) && currentValues.indexOf(key) > -1
            });
        });

        return results;
    }

    selectKey(titleKey: string, selector: SelectHobbiesGroupKey) {
        if (titleKey === 'SPORTS') {
            this.sports = this.addRemoveKeyInList(this.sports, selector);
        } else if (titleKey === 'ARTS') {
            this.arts = this.addRemoveKeyInList(this.arts, selector);
        } else if (titleKey === 'FOOD') {
            this.food = this.addRemoveKeyInList(this.food, selector);
        } else if (titleKey === 'PLACES') {
            this.places = this.addRemoveKeyInList(this.places, selector);
        }
    }

    private addRemoveKeyInList(currentList: string[], selector: SelectHobbiesGroupKey): string[] {
        if (currentList == null) {
            currentList = new Array();
        }

        if (currentList.indexOf(selector.key) > -1) {
            currentList.splice(currentList.indexOf(selector.key), 1);
        } else {
            currentList.push(selector.key);
        }

        return currentList;
    }

    close() {
        const result: SelectHobbiesResult = {
            sports: this.sports,
            arts: this.arts,
            food: this.food,
            places: this.places
        };

        this.modalController.dismiss(result).then(() => {
            // Do nothing
        });
    }
}
