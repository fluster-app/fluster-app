import {Component} from '@angular/core';
import {ModalController, NavParams, Platform} from '@ionic/angular';

// Abstract modal
import {AbstractWizardModal} from '../../core/abstract-wizard-modal';

@Component({
    templateUrl: 'select-floor.html',
    styleUrls: ['./select-floor.scss'],
    selector: 'app-select-floor'
})
export class SelectFloorModal extends AbstractWizardModal {

    initialValue: string;

    floors: number[];

    constructor(protected platform: Platform,
                private navParams: NavParams,
                private modalController: ModalController) {
        super(platform);

        this.floors = new Array();
    }

    ionViewWillEnter() {
        this.initialValue = this.navParams.get('initialValue');

        this.pushFloors().then(() => {
            // Do nothing;
        });
    }

    private pushFloors(): Promise<{}> {
        const self = this;

        return new Promise((resolve) => {

            for (let i: number = this.RESOURCES.ITEM.DETAIL.FLOOR.MIN; i <= this.RESOURCES.ITEM.DETAIL.FLOOR.MAX; i++) {
                self.floors.push(i);
            }

            resolve();
        });
    }

    selectAndNavigate(selectedValue: number) {
        this.modalController.dismiss(selectedValue).then(() => {
            // Do nothing
        });
    }

    close() {
        this.modalController.dismiss(this.initialValue).then(() => {
            // Do nothing
        });
    }
}
