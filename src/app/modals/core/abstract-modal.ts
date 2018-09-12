import {AbstractPage} from '../../pages/abstract-page';
import {NavParams} from '@ionic/angular';

export abstract class AbstractModal extends AbstractPage {

    protected checkAdDisplayParams(navParams: NavParams) {
        this.isAdDisplay = navParams.get('adDisplay') === true;
    }

}
