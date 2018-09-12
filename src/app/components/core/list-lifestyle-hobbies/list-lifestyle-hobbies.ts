import {Component, Input, AfterViewInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';

import {TranslateService} from '@ngx-translate/core';

// Modal
import {SelectLifestyleModal} from '../../../modals/core/select-lifestyle/select-lifestyle';
import {SelectHobbiesModal} from '../../../modals/core/select-hobbies/select-hobbies';

// Model
import {User, UserDescriptionLifestyle, UserDescriptionHobbies} from '../../../services/model/user/user';
import {SelectHobbiesResult} from '../../../services/model/utils/hobbies';

// Resources
import {Resources} from '../../../services/core/utils/resources';
import {Comparator} from '../../../services/core/utils/utils';

export interface ListHobbiesSummary {
    value: string;
    count: number;
}

@Component({
    templateUrl: 'list-lifestyle-hobbies.html',
    styleUrls: ['./list-lifestyle-hobbies.scss'],
    selector: 'app-list-lifestyle-hobbies'
})
export class ListLifestyleHobbiesComponent implements AfterViewInit {

    RESOURCES: any = Resources.Constants;

    @Input() user: User;

    @Input() adDisplay: boolean = false;

    hobbiesSummary: string = '';

    constructor(private modalController: ModalController,
                private translateService: TranslateService) {

    }

    ngAfterViewInit(): void {
        this.loadHobbiesSummary().then((result: string) => {
            this.hobbiesSummary = result;
        });
    }

    // Clean

    navigateToCleanlinessSelection() {
        const updateFunction = ((result: string) => {
            this.initLifestyle();
            result != null ? this.user.description.lifestyle.cleanliness = result : delete this.user.description.lifestyle.cleanliness;
        });

        this.navigateToLifestyleSelection('USER_PROFILE.LIFESTYLE.CLEANLINESS.TITLE', 'CLEANLINESS',
            this.RESOURCES.USER.LIFESTYLE.CLEANLINESS, Comparator.isEmpty(this.user.description.lifestyle) ?
                null : this.user.description.lifestyle.cleanliness, updateFunction);
    }

    // Guest

    navigateToGuestsSelection() {
        const updateFunction = ((result: string) => {
            this.initLifestyle();
            result != null ? this.user.description.lifestyle.guests = result : delete this.user.description.lifestyle.guests;
        });

        this.navigateToLifestyleSelection('USER_PROFILE.LIFESTYLE.GUESTS.TITLE', 'GUESTS',
            this.RESOURCES.USER.LIFESTYLE.GUESTS, Comparator.isEmpty(this.user.description.lifestyle) ?
                null : this.user.description.lifestyle.guests, updateFunction);
    }

    // Party

    navigateToPartySelection() {
        const updateFunction = ((result: string) => {
            this.initLifestyle();
            result != null ? this.user.description.lifestyle.party = result : delete this.user.description.lifestyle.party;
        });

        this.navigateToLifestyleSelection('USER_PROFILE.LIFESTYLE.PARTY.TITLE', 'PARTY',
            this.RESOURCES.USER.LIFESTYLE.PARTY, Comparator.isEmpty(this.user.description.lifestyle) ?
                null : this.user.description.lifestyle.party, updateFunction);
    }

    // Food

    navigateToFoodSelection() {
        const updateFunction = ((result: string) => {
            this.initLifestyle();
            result != null ? this.user.description.lifestyle.food = result : delete this.user.description.lifestyle.food;
        });

        this.navigateToLifestyleSelection('USER_PROFILE.LIFESTYLE.FOOD.TITLE', 'FOOD',
            this.RESOURCES.USER.LIFESTYLE.FOOD, Comparator.isEmpty(this.user.description.lifestyle) ?
                null : this.user.description.lifestyle.food, updateFunction);
    }


    // Gender

    navigateToGenderSelection() {
        const updateFunction = ((result: string) => {
            !Comparator.isStringEmpty(result) ? this.user.facebook.gender = result : delete this.user.facebook.gender;
        });

        const gender: string[] = new Array();
        gender.push(this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.MALE);
        gender.push(this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.FEMALE);

        this.navigateToLifestyleSelection('USER_PROFILE.LIFESTYLE.GENDER.TITLE', 'GENDER', gender,
            this.user.facebook.gender, updateFunction);
    }

    // Selection modal

    private async navigateToLifestyleSelection(title: string, translationKey: string, keys: string[], selected: string, updateFunction: any) {
        const modal: HTMLIonModalElement = await this.modalController.create({
            component: SelectLifestyleModal,
            componentProps: {
                adDisplay: this.adDisplay,
                title: title,
                translationKey: translationKey,
                keys: keys,
                selected: selected
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            updateFunction(detail.data);
        });

        await modal.present().then(() => {
            // Do nothing
        });
    }

    private initLifestyle() {
        if (Comparator.isEmpty(this.user.description.lifestyle)) {
            this.user.description.lifestyle = new UserDescriptionLifestyle();
        }
    }

    // Hobbies

    async navigateToHobbiesSelection() {
        const modal: HTMLIonModalElement = await this.modalController.create({
            component: SelectHobbiesModal,
            componentProps: {
                adDisplay: this.adDisplay,
                sports: this.hasHobbies() ? this.user.description.hobbies.sports : null,
                arts: this.hasHobbies() ? this.user.description.hobbies.arts : null,
                food: this.hasHobbies() ? this.user.description.hobbies.food : null,
                places: this.hasHobbies() ? this.user.description.hobbies.places : null
            }
        });

        const updateFunction = ((result: SelectHobbiesResult) => {
            if (Comparator.isEmpty(result)) {
                // Backdrop dismiss gives no result back
                return;
            }

            this.initLifestyle();

            if (Comparator.isEmpty(this.user.description.hobbies)) {
                this.user.description.hobbies = new UserDescriptionHobbies();
            }

            Comparator.hasElements(result.sports) ? this.user.description.hobbies.sports = result.sports :
                delete this.user.description.hobbies.sports;
            Comparator.hasElements(result.arts) ? this.user.description.hobbies.arts = result.arts :
                delete this.user.description.hobbies.arts;
            Comparator.hasElements(result.food) ? this.user.description.hobbies.food = result.food :
                delete this.user.description.hobbies.food;
            Comparator.hasElements(result.places) ? this.user.description.hobbies.places = result.places :
                delete this.user.description.hobbies.places;

            if (Comparator.isEmpty(this.user.description.hobbies)) {
                delete this.user.description.hobbies;
            }

            this.loadHobbiesSummary().then((resultHobbies: string) => {
                this.hobbiesSummary = resultHobbies;
            });
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            updateFunction(detail.data);
        });

        await modal.present().then(() => {
            // Do nothing
        });
    }

    hasHobbies(): boolean {
        return !Comparator.isEmpty(this.user.description.hobbies) && (
            Comparator.hasElements(this.user.description.hobbies.sports) ||
            Comparator.hasElements(this.user.description.hobbies.arts) ||
            Comparator.hasElements(this.user.description.hobbies.food) ||
            Comparator.hasElements(this.user.description.hobbies.places)
        );
    }

    private loadHobbiesSummary(): Promise<string> {
        return new Promise((resolve) => {
            let result: ListHobbiesSummary = {value: '', count: 0};

            if (this.hasHobbies()) {
                result = this.concatHobbiesSummary(result, 'SPORTS', this.user.description.hobbies.sports);
                result = this.concatHobbiesSummary(result, 'ARTS', this.user.description.hobbies.arts);
                result = this.concatHobbiesSummary(result, 'FOOD', this.user.description.hobbies.food);
                result = this.concatHobbiesSummary(result, 'PLACES', this.user.description.hobbies.places);
            }

            if (!Comparator.isStringEmpty(result.value)) {
                result.value = result.value.slice(0, -1 * ', '.length);
            }

            resolve(result.value);
        });
    }

    private concatHobbiesSummary(current: ListHobbiesSummary, group: string, values: string[]): ListHobbiesSummary {
        // We want to concat maximum six values, that's enough for display and for performance reason
        if (current.count >= 6) {
            return current;
        }

        if (Comparator.hasElements(values)) {
            const tmp: string[] = values.length >= 6 ? values.slice(0, 6) : values;

            for (let i: number = 0; i < tmp.length; i++) {
                current.value += this.translateService.instant('USER_PROFILE.HOBBIES.' + group + '.' + tmp[i].toUpperCase());
                current.value += ', ';

                current.count++;

                if (current.count >= 6) {
                    return current;
                }
            }
        }

        return current;
    }
}
