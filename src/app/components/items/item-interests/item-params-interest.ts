import {Component, Input} from '@angular/core';
import {ModalController, PopoverController} from '@ionic/angular';

// Page and modal
import {AbstractItemInterestComponent} from './abstract-item-interest';

// Model
import {User, UserInterest} from '../../../services/model/user/user';

// Resources and utils
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {SubscriptionService} from '../../../services/core/user/subscription-service';

@Component({
    templateUrl: 'item-params-interest.html',
    selector: 'app-item-params-interest'
})
export class ItemParamsInterestComponent extends AbstractItemInterestComponent {

    @Input() user: User;

    @Input() interest: UserInterest;

    constructor(protected modalController: ModalController,
                protected popoverController: PopoverController,
                protected subscriptionService: SubscriptionService) {
        super(modalController, popoverController, subscriptionService);
    }

    hasInterest(): boolean {
        return !Comparator.isEmpty(this.interest);
    }

    protected async doEditInterestAndOpenModal() {
        if (this.hasInterest()) {
            await this.openInterestModal(this.interest, this.user, false);
        } else {
            await this.openInterestModal(null, this.user, false);
        }
    }

}
