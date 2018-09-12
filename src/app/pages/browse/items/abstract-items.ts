import {PopoverController} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';
import {OverlayEventDetail} from '@ionic/core';

// Pages
import {AbstractPage} from '../../abstract-page';

// Modal
import {ProductPickerPopover} from '../../../modals/core/product-picker/product-picker';

// Model
import {ItemUser} from '../../../services/model/item/item-user';

// Services
import {ItemUsersService} from '../../../services/browse/item-users-service';

export abstract class AbstractItemsPage extends AbstractPage {

    constructor(protected popoverController: PopoverController,
                protected itemUsersService: ItemUsersService) {
        super();
    }

    // Save item interests
    protected saveInterests(itemUser: ItemUser): Promise<{}> {
        return new Promise((resolve) => {
            if (itemUser == null) {
                resolve();
            } else {
                this.itemUsersService.saveItemUser(itemUser).then((result: ItemUser) => {
                    // Do nothing. If save doesn't work, we just not gonna display some interests in the saved view for the user.
                    resolve();
                }, (response: HttpErrorResponse) => {
                    // Do nothing, we ignore the notifications error
                    resolve();
                });
            }
        });
    }

    protected async showProductModal(actionOnSucces: any) {
        const modal: HTMLIonPopoverElement = await this.getProductModal();

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            if (detail.data) {
                actionOnSucces();
            }
        });

        await modal.present();
    }

    protected getProductModal(): Promise<HTMLIonPopoverElement> {
        return new Promise((resolve) => {
            this.popoverController.create({
                component: ProductPickerPopover,
                componentProps: {
                    adDisplay: this.isAdDisplay
                },
                cssClass: 'product-modal',
                backdropDismiss: false
            }).then((modal: HTMLIonPopoverElement) => {
                resolve(modal);
            });
        });
    }
}
