import {ModalController, PopoverController} from '@ionic/angular';
import {EventEmitter, Input, Output} from '@angular/core';
import {OverlayEventDetail} from '@ionic/core';

// Abstract
import {AbstractPage} from '../../../pages/abstract-page';

// Modal
import {ProductPickerPopover} from '../../../modals/core/product-picker/product-picker';
import {SelectInterestModal} from '../../../modals/browse/select-interest/select-interest';

// Model
import {User, UserInterest} from '../../../services/model/user/user';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {SubscriptionService} from '../../../services/core/user/subscription-service';

export abstract class AbstractItemInterestComponent extends AbstractPage {

    @Output() notifiyUpdated: EventEmitter<UserInterest> = new EventEmitter<UserInterest>();

    @Input() index: number;

    constructor(protected modalController: ModalController,
                protected popoverController: PopoverController,
                protected subscriptionService: SubscriptionService) {
        super();
    }

    async editInterestAndOpenModal($event: any) {
        // Prevent calling (don't call) parent click
        $event.preventDefault();
        $event.stopPropagation();

        if (!this.subscriptionService.couldAddInterest(this.index)) {
            await this.displayProductSubscriptionModal();
        } else {
            await this.doEditInterestAndOpenModal();
        }
    }

    private async displayProductSubscriptionModal() {
        const modal: HTMLIonPopoverElement = await this.popoverController.create({
            component: ProductPickerPopover,
            componentProps: {
                adDisplay: this.isAdDisplay
            },
            cssClass: 'product-modal',
            backdropDismiss: false
        });

        modal.onDidDismiss().then(() => {
            // Do nothing
        });

        await modal.present();
    }

    protected abstract doEditInterestAndOpenModal();

    protected async openInterestModal(interest: UserInterest, user: User, doSave: boolean) {
        const modal: HTMLIonModalElement = await this.modalController.create({
            component: SelectInterestModal,
            componentProps: {
                interest: interest,
                index: this.index,
                user: user,
                save: doSave
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            if (!Comparator.isEmpty(detail) && !Comparator.isEmpty(detail.data)) {
                this.notifiyUpdated.emit(detail.data);
            }
        });

        await modal.present();
    }

}
