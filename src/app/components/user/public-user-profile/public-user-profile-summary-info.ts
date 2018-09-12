import {Component, Input} from '@angular/core';

import * as moment from 'moment';

// Model
import {User} from '../../../services/model/user/user';

// Utils
import {Resources} from '../../../services/core/utils/resources';
import {Comparator, Converter} from '../../../services/core/utils/utils';

@Component({
    templateUrl: 'public-user-profile-summary-info.html',
    styleUrls: ['./public-user-profile-summary-info.scss'],
    selector: 'app-public-user-profile-summary-info'
})
export class PublicUserProfileSummaryInfoComponent {

    RESOURCES: any = Resources.Constants;

    @Input() user: User;

    @Input() displaySensitive: boolean = false;

    @Input() displayLocation: boolean = true;

    @Input() advertiserInfoDisplay: boolean = false;

    constructor() {

    }

    lastNameShoudlBeDisplayed(): boolean {
        return this.displaySensitive
            && !Comparator.isEmpty(this.user.description)
            && this.user.description.displayName;
    }

    getAge(): number {
        return moment().diff(moment(Converter.getDateObj(this.user.facebook.birthday)), 'year');
    }

    hasLocation(): boolean {
        return !Comparator.isEmpty(this.user.facebook.location);
    }

    getLocation(): string {
        return this.hasLocation() ? this.user.facebook.location.name : '';
    }
}
