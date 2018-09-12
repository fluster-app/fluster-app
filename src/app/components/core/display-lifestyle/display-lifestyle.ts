import {Component, Input, AfterViewInit} from '@angular/core';

import {TranslateService} from '@ngx-translate/core';

// Resources
import {Comparator} from '../../../services/core/utils/utils';

@Component({
    templateUrl: 'display-lifestyle.html',
    styleUrls: ['./display-lifestyle.scss'],
    selector: 'app-display-lifestyle'
})
export class DisplayLifestyleComponent implements AfterViewInit {

    @Input() key: string;

    @Input() keyValue: string;

    constructor(private translateService: TranslateService) {

    }

    ngAfterViewInit(): void {

    }

    getTranslationKey(): string {
        if (Comparator.isStringEmpty(this.key) || this.isKeyValueEmpty()) {
            return this.translateService.instant('USER_PROFILE.LIFESTYLE.NONE');
        } else {
            return this.translateService.instant('USER_PROFILE.LIFESTYLE.' + this.key + '.' + this.keyValue.toUpperCase().trim());
        }
    }

    isKeyValueEmpty() {
        return Comparator.isStringEmpty(this.keyValue);
    }
}
