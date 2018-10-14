import {Platform} from '@ionic/angular';
import {HostListener} from '@angular/core';

// Abstract
import {AbstractModal} from './abstract-modal';

export abstract class AbstractWizardModal extends AbstractModal {

    constructor(protected platform: Platform) {
        super();
    }

    @HostListener('document:ionBackButton', ['$event'])
    private overrideHardwareBackAction($event: any) {
        this.close();
    }

    abstract close();
}
