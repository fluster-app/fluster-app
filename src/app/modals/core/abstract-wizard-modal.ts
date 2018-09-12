import {Platform} from '@ionic/angular';

import {Subscription} from 'rxjs';

// Abstract
import {AbstractModal} from './abstract-modal';

export abstract class AbstractWizardModal extends AbstractModal {

    protected customBackActionSubscription: Subscription;

    constructor(protected platform: Platform) {
        super();

        this.overrideHardwareBackAction();
    }

    private overrideHardwareBackAction() {
        this.platform.ready().then(() => {
            this.customBackActionSubscription = this.platform.backButton.subscribe(() => {
                this.close();
            });
        });
    }

    protected unregisterBackAction() {
        if (this.customBackActionSubscription) {
            this.customBackActionSubscription.unsubscribe();
        }
    }

    abstract close();
}
