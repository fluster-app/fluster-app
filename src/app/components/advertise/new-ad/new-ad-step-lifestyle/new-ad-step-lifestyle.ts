import {Component, Input, ViewChild, Output, EventEmitter} from '@angular/core';
import {Platform, Slides} from '@ionic/angular';

// Model
import {Item} from '../../../../services/model/item/item';
import {User} from '../../../../services/model/user/user';

// Utils
import {Comparator} from '../../../../services/core/utils/utils';

// Pages
import {AbstractNewAdComponent} from '../abstract-new-ad';
import {TargetedUsersComponent} from '../../targeted-users/targeted-users';

// Service
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {UserSessionService} from '../../../../services/core/user/user-session-service';

@Component({
    templateUrl: 'new-ad-step-lifestyle.html',
    styleUrls: ['./new-ad-step-lifestyle.scss'],
    selector: 'app-new-ad-step-lifestyle'
})
export class NewAdStepLifestyleComponent extends AbstractNewAdComponent {

    @Output() notifyPrev: EventEmitter<{}> = new EventEmitter<{}>();

    @Output() notifiyPublishCall: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild(TargetedUsersComponent) public targetedUsers: TargetedUsersComponent;

    newItem: Item;

    user: User;
    private originalUser: User;

    @Input() slider: Slides;

    constructor(private platform: Platform,
                protected newItemService: NewItemService,
                private userSessionService: UserSessionService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(newItemService);

        this.newItem = this.newItemService.getNewItem();
        this.user = this.userSessionService.getUser();

        this.setOriginalUser();
    }

    private setOriginalUser() {
        this.originalUser = JSON.parse(JSON.stringify(this.user));
    }

    next() {
        if (!Comparator.equals(this.originalUser, this.user)) {
            // Will allow us to detect the modification to update the user
            this.userSessionService.setUserToSave(this.user);
        }

        this.notifiyPublishCall.emit();

        this.gaTrackEventOnce(this.platform, this.googleAnalyticsNativeService,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.STEP_LIFESTYLE);
    }

    swipeSlide($event: any) {
        if ($event != null) {
            if ($event.deltaX > 0) {
                // Prev
                this.notifyPrev.emit();
            } else if ($event.deltaX <= 0) {
                // Next
                this.next();
            }
        }
    }

}
