import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {ModalController, NavParams, Slides} from '@ionic/angular';

// Abstract
import {AbstractModal} from '../abstract-modal';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

@Component({
    templateUrl: 'photo-lightbox.html',
    styleUrls: ['./photo-lightbox.scss'],
    selector: 'app-photo-lightbox'
})
export class PhotoLightboxModal extends AbstractModal implements AfterViewInit {

    @ViewChild('photoLightboxSlider') private slides: Slides;

    images: string[];

    rootUrl: string;

    viewEntered: boolean = false;

    begin: boolean = true;
    end: boolean = true;

    constructor(private navParams: NavParams,
                private modalController: ModalController) {
        super();
    }

    ngAfterViewInit() {
        // Workaround in order to not display briefly the arrow back when opening modal
        setTimeout(() => {
            this.viewEntered = true;
        }, 50);
    }

    close() {
        this.modalController.dismiss().then(() => {
            // Do nothing
        });
    }

    ionViewWillEnter() {
        this.checkAdDisplayParams(this.navParams);

        this.images = this.navParams.get('itemImages');
        this.rootUrl = this.navParams.get('rootUrl');
    }

    async previousImage() {
        if (!this.slides) {
            return;
        }

        this.slides.slidePrev(0);
    }

    async nextImage() {
        if (!this.slides) {
            return;
        }

        this.slides.slideNext(0);
    }

    hasImages(): boolean {
        return Comparator.hasElements(this.images);
    }

    async slidePosition() {
        if (!this.slides) {
            return;
        }

        this.begin = await this.slides.isBeginning();

        this.end = await this.slides.isEnd();
    }

}
