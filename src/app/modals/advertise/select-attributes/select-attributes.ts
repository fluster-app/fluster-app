import {Component} from '@angular/core';

// Modal
import {AbstractWizardModal} from '../../core/abstract-wizard-modal';
import {ModalController, NavParams, Platform} from '@ionic/angular';

@Component({
    templateUrl: 'select-attributes.html',
    styleUrls: ['./select-attributes.scss'],
    selector: 'app-select-attributes'
})
export class SelectAttributesModal extends AbstractWizardModal {

    attributes: number[];

    initialValue: number;

    title: string;

    labelSingular: string;
    labelPlural: string;

    constructor(protected platform: Platform,
                private modalController: ModalController,
                private navParams: NavParams) {
        super(platform);

        this.attributes = new Array();
    }

    ionViewWillEnter() {
        this.title = this.navParams.get('title');
        this.labelSingular = this.navParams.get('labelSingular');
        this.labelPlural = this.navParams.get('labelPlural');

        this.initialValue = this.navParams.get('initialValue');

        const increment: number = this.navParams.get('increment');
        const maxValue: number = this.navParams.get('maxValue');
        const minValue: number = this.navParams.get('minValue') != null ? this.navParams.get('minValue') : 1;

        this.pushValues(increment, maxValue, minValue).then(() => {
            // Do nothing;
        });
    }

    private pushValues(increment: number, maxValue: number, minValue: number): Promise<{}> {
        const self = this;

        return new Promise((resolve) => {
            for (let i: number = minValue; i < maxValue; i = i + increment) {
                self.attributes.push(i);
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
