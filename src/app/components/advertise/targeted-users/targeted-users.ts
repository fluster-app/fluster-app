import {Component, Input, OnChanges, SimpleChange, OnDestroy} from '@angular/core';

import {Subscription} from 'rxjs';

// Model
import {Item} from '../../../services/model/item/item';
import {Location} from '../../../services/model/location/location';

// Resources and utils
import {Resources} from '../../../services/core/utils/resources';
import {Comparator} from '../../../services/core/utils/utils';
import {ItemsComparator} from '../../../services/core/utils/items-utils';

// Services
import {AdsStatisticsService} from '../../../services/advertise/ads-statistics-service';

@Component({
    templateUrl: 'targeted-users.html',
    styleUrls: ['./targeted-users.scss'],
    selector: 'app-targeted-users'
})
export class TargetedUsersComponent implements OnChanges, OnDestroy {

    MIN_TARGETED_USERS: number = Resources.Constants.STATISTICS.TARGETED_USERS.MIN_TARGETED_USERS;
    MAX_TARGETED_USERS: number = Resources.Constants.STATISTICS.TARGETED_USERS.MAX_TARGETED_USERS;

    notifierSubscription: Subscription;

    @Input() item: Item;

    @Input() msgLocation: boolean = false;

    @Input() countTargetedUsers: number = 0;

    @Input() location: Location;
    @Input() type: string;
    @Input() furnished: boolean;
    @Input() rooms: number;
    @Input() price: number;
    @Input() disabledFriendly: boolean;
    @Input() petsAllowed: boolean;

    @Input() ageMin: number;
    @Input() ageMax: number;
    @Input() gender: string;

    @Input() admin: boolean = false;

    constructor(private adsStatisticsService: AdsStatisticsService) {

        this.notifierSubscription = this.adsStatisticsService.notifyAdsStatisticsChanged
            .subscribe((newCountTargetedUsers: number) => (this.countTargetedUsers = newCountTargetedUsers));
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        // Only start refresh when one single change happened or if we wish thru the admin variable
        if ((!Comparator.isEmpty(changes) && Object.keys(changes).length === 1) || this.admin) {
            if (!Comparator.isEmpty(changes['price'])) {
                if (!Comparator.isNumberNullOrZero(changes['price'].currentValue) && changes['price'].currentValue >= 100) {
                    // Don't refresh statistics below 100 CHF or whatever
                    this.findTotalTargetedUsers();
                }
            } else {
                this.findTotalTargetedUsers();
            }
        }
    }

    ngOnDestroy(): void {
        if (this.notifierSubscription != null) {
            this.notifierSubscription.unsubscribe();
        }
    }

    // Manually call an update of the statistics
    update() {
        this.findTotalTargetedUsers();
    }

    isItemShare() {
        return ItemsComparator.isItemShare(this.item);
    }

    isItemFlat() {
        return ItemsComparator.isItemFlat(this.item);
    }

    private findTotalTargetedUsers() {

        if (Comparator.isEmpty(this.item) || Comparator.isEmpty(this.item.address)) {
            return;
        }

        this.adsStatisticsService.calculateTargetedUsers(this.item);
    }


}
