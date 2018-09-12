import {AfterViewInit, Component, Input} from '@angular/core';

// Model
import {UserDescriptionHobbies} from '../../../services/model/user/user';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

@Component({
    templateUrl: 'display-hobbies.html',
    styleUrls: ['./display-hobbies.scss'],
    selector: 'app-display-hobbies'
})
export class DisplayHobbiesComponent implements AfterViewInit {

    @Input() hobbies: UserDescriptionHobbies;
    @Input() gender: string;

    @Input() advertiserInfoDisplay: boolean = false;

    allHobbies: string[];

    constructor() {

    }

    ngAfterViewInit(): void {
        this.concatHobbies().then((results: string[]) => {
            this.allHobbies = results;
        });
    }

    private concatHobbies(): Promise<string[]> {
        return new Promise((resolve) => {
            let results: string[] = new Array();

            if (!Comparator.isEmpty(this.hobbies)) {
                if (Comparator.hasElements(this.hobbies.sports)) {
                    results = results.concat(this.hobbies.sports);
                }

                if (Comparator.hasElements(this.hobbies.arts)) {
                    results = results.concat(this.hobbies.arts);
                }

                if (Comparator.hasElements(this.hobbies.food)) {
                    results = results.concat(this.hobbies.food);
                }

                if (Comparator.hasElements(this.hobbies.places)) {
                    results = results.concat(this.hobbies.places);
                }
            }

            resolve(results);
        });
    }

    hasAllHobbies(): boolean {
        return Comparator.hasElements(this.allHobbies);
    }

    getGenderStyleclass(): string {
        if (Comparator.isStringEmpty(this.gender)) {
            return '';
        } else {
            return '-' + this.gender;
        }
    }

}
