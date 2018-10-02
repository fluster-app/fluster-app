import {Platform} from '@ionic/angular';
import {HostListener} from '@angular/core';

import {Subscription} from 'rxjs';

// Abstract
import {AbstractModal} from './abstract-modal';

export abstract class AbstractWizardModal extends AbstractModal {

    protected customBackActionSubscription: Subscription;

    constructor(protected platform: Platform) {
        super();

        // TODO: Uncomment for Ionic v4-beta.13
        // this.overrideHardwareBackAction();
    }

    // TODO: Uncomment for Ionic v4-beta.13
    // private overrideHardwareBackAction() {
    //     this.platform.ready().then(() => {
    //         this.customBackActionSubscription = this.platform.backButton.subscribeWithPriority(() => {
    //             this.close();
    //         });
    //     });
    // }

    // TODO: Remove for Ionic v4-beta.13
    @HostListener('document:ionBackButton', ['$event'])
    private overrideHardwareBackAction($event: any) {
        this.close();
    }

    protected unregisterBackAction() {
        if (this.customBackActionSubscription) {
            this.customBackActionSubscription.unsubscribe();
        }
    }

    abstract close();
}
