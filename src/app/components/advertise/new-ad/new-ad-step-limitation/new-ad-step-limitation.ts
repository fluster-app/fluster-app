import {Component, Input, ViewChild, Output, EventEmitter, AfterViewInit} from '@angular/core';
import {Range, Platform, Slides} from '@ionic/angular';

// Model
import {Item} from '../../../../services/model/item/item';

// Pages
import {AbstractNewAdComponent} from '../abstract-new-ad';
import {TargetedUsersComponent} from '../targeted-users/targeted-users';

// Utils
import {ItemsComparator} from '../../../../services/core/utils/items-utils';
import {Comparator} from '../../../../services/core/utils/utils';

// Service
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';

export interface SelectedAges {
    lower: number;
    upper: number;
}

@Component({
    templateUrl: 'new-ad-step-limitation.html',
    styleUrls: ['./new-ad-step-limitation.scss'],
    selector: 'app-new-ad-step-limitation'
})
export class NewAdStepLimitationComponent extends AbstractNewAdComponent implements AfterViewInit {

    @Output() notifyPrev: EventEmitter<{}> = new EventEmitter<{}>();

    @Output() notifiyPublishCall: EventEmitter<{}> = new EventEmitter<{}>();

    @ViewChild(TargetedUsersComponent) public targetedUsers: TargetedUsersComponent;

    newItem: Item;

    @Input() slider: Slides;

    ages: SelectedAges = {
        lower: this.RESOURCES.ITEM.USER_RESTRICTIONS.AGE.MIN,
        upper: this.RESOURCES.ITEM.USER_RESTRICTIONS.AGE.MAX
    };

    male: boolean = true;
    female: boolean = true;

    constructor(private platform: Platform,
                protected newItemService: NewItemService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(newItemService);

        this.newItem = this.newItemService.getNewItem();

        this.init();
    }

    ngAfterViewInit() {
        this.targetedUsers.update();
    }

    onAgeChange(ev: Range) {
        this.newItem.userLimitations.age.min = this.ages.lower;
        this.newItem.userLimitations.age.max = this.ages.upper;

        this.targetedUsers.update();
    }

    onGenderChange() {
        this.updateItemGender();

        this.targetedUsers.update();
    }

    private init() {
        this.ages = {lower: this.newItem.userLimitations.age.min, upper: this.newItem.userLimitations.age.max};

        this.male = true;
        this.female = true;

        if (this.newItem.userLimitations.gender === this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.MALE) {
            this.female = false;
        } else if (this.newItem.userLimitations.gender === this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.FEMALE) {
            this.male = false;
        }
    }

    isItemShare() {
        return ItemsComparator.isItemShare(this.newItem);
    }

    isItemFlat() {
        return ItemsComparator.isItemFlat(this.newItem);
    }

    isNextAllowed(): boolean {
        return this.male || this.female;
    }

    private updateItemGender() {
        if (this.male && this.female) {
            this.newItem.userLimitations.gender = this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.IRRELEVANT;
        } else if (this.male) {
            this.newItem.userLimitations.gender = this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.MALE;
        } else if (this.female) {
            this.newItem.userLimitations.gender = this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.FEMALE;
        }
    }

    next() {
        this.updateItemGender();

        this.notifiyPublishCall.emit();

        this.gaTrackEventOnce(this.platform, this.googleAnalyticsNativeService,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.STEP_LIMITATION);
    }

    // HACK: ion-range trigger parent swip too, we should avoid to swipe on range change
    private isSwipeRange($event: any): boolean {
        return $event != null && $event.target != null && !Comparator.isStringEmpty($event.target.className) &&
            $event.target.className.indexOf('range') > -1;
    }

    swipeSlide($event: any) {
        if ($event != null && !this.isSwipeRange($event)) {
            if ($event.deltaX > 0) {
                // Prev
                this.notifyPrev.emit();
            }

            // Last step, publish has to be confirm by pressing button
        }
    }

    isActivation(): boolean {
        return this.newItemService.isActivation();
    }
}
