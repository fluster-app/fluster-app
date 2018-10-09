import {
    Component, EventEmitter, Input, OnChanges, Output, SimpleChange,
    ViewChild
} from '@angular/core';
import {MenuController, ModalController, Platform, Slides} from '@ionic/angular';

// Pages
import {AbstractPage} from '../../../pages/abstract-page';

// Modal
import {PhotoLightboxModal} from '../../../modals/core/photo-lightbox/photo-lightbox';

// Model
import {Item} from '../../../services/model/item/item';

// Utils
import {Comparator} from '../../../services/core/utils/utils';
import {ItemsComparator} from '../../../services/core/utils/items-utils';

// Services
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'item-slides.html',
    styleUrls: ['./item-slides.scss'],
    selector: 'app-item-slides'
})
export class ItemSlidesComponent extends AbstractPage implements OnChanges {

    @Input() item: Item;
    @Input() zIndex: number;
    @Input() renderSlides: boolean = false;

    @Input() adDisplay: boolean = false;

    @Input() displayFirstAccessMsg: boolean;
    @Input() displayFirstSuperstarMsg: boolean = false;
    @Input() displayLimitedAndLightbox: boolean = false;

    @Output() initFirstAccessMsg: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() hideFirstAccessMsg: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() hideFirstSuperstarMsg: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('itemSlider') private slides: Slides;

    itemImages: string[];

    @Input() displayAdvertiserSlide: boolean = false;
    @Input() displayAdvertiserInfo: boolean = false;

    displayAdvertiserAvatar: boolean = false;

    @Input() displayItemExpire: boolean = false;

    itemExpired: boolean = false;
    itemExpiringSoon: boolean = false;

    @Input() sliderOnlyExternal: boolean = true;

    constructor(private platform: Platform,
                private menuController: MenuController,
                private modalController: ModalController,
                private googleAnalyticsService: GoogleAnalyticsNativeService) {
        super();
    }

    async ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (!Comparator.isEmpty(changes['item']) && !Comparator.isEmpty(changes['item'].currentValue) && !Comparator.equals(changes['item'].currentValue, changes['item'].previousValue)) {
            this.itemImages = await this.concatImages();

            await this.updateSlider();

            this.itemExpired = !Comparator.isEmpty(this.item) && ItemsComparator.isItemExpired(this.item);
            this.itemExpiringSoon = !Comparator.isEmpty(this.item) && ItemsComparator.isItemExpiringSoon(this.item);
        }
    }

    private concatImages(): Promise<string[]> {
        return new Promise<string[]>((resolve) => {
            if (!this.renderSlides || Comparator.isEmpty(this.item)) {
                resolve(this.itemImages);
            } else {
                let result: string[] = new Array();

                result.push(this.item.mainPhoto);

                if (!Comparator.isEmpty(this.item.itemDetail.otherPhotos)) {
                    result.push(...this.item.itemDetail.otherPhotos);
                }

                //removeIf(production)
                if (Comparator.equals(this.item.mainPhoto, 'mockup.jpg')) {
                    result = new Array();

                    result.push(this.RESOURCES.AWS.S3_URL + '/' + this.item.source + '/mockup/mockup.jpg');
                    result.push(this.RESOURCES.AWS.S3_URL + '/' + this.item.source + '/mockup/mockup.jpg');
                }
                //endRemoveIf(production)

                resolve(result);
            }
        });
    }

    // HACK: For a weird reason, when we update an ad and go back to the detail of the ad
    // The slider doesn't pick the removed photos. For example if we had 3 photos and removed one
    // The slider will still display 3 slides with an empty one instead of two
    // Furthermore we can't wait for an event or so, we have to add a small delay to let the slider
    // pick the update
    private async updateSlider() {
        if (this.slides && Comparator.hasElements(this.itemImages)) {
            const length: number = await this.slides.length();
            const lengthShould: number = this.displayAdvertiserSlide && this.isItemShare() ? this.itemImages.length + 1 : this.itemImages.length;

            if (length > lengthShould) {
                setTimeout(() => {
                    this.slides.update();
                }, 100);
            }
        }
    }

    async prevNextPhotos($event: any) {
        if (this.displayFirstAccessMsg == null) {
            this.initFirstAccessMsg.emit(true);
            return;
        }

        if (!$event) {
            return;
        }

        if (!$event.detail) {
            return;
        }

        const clientX: number = $event.detail ? $event.detail.clientX : null;
        const clientXTouched: number = Comparator.hasElements($event.detail.changedTouches) ? $event.detail.changedTouches[0].clientX : null;

        if (!clientX && !clientXTouched) {
            return;
        }

        this.gaTrackEvent(this.platform, this.googleAnalyticsService,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ITEMS, this.displayAdvertiserSlide ?
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ITEMS.SLIDES.ADVERTISER :
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ITEMS.SLIDES.NO_ADVERTISER);

        const menuName: string = this.adDisplay ? 'menuAdvertise' : 'menuBrowse';
        const menu: HTMLIonMenuElement = await this.menuController.get(menuName);
        const menuOffset: number = menu ? menu.clientWidth : 0;

        const viewWidth: number = this.platform.width();

        const currentX: number = clientX ? clientX : clientXTouched;

        if ((currentX - menuOffset) <= ((viewWidth - menuOffset) / 2)) {
            this.previousImage();
        } else {
            this.nextImage();
        }
    }

    private previousImage() {
        if (!this.slides) {
            return;
        }

        this.slides.slidePrev(0);
    }

    private nextImage() {
        if (!this.slides || !this.slides) {
            return;
        }

        this.slides.slideNext(0);
    }

    emitHideFirstAccessMsg() {
        this.displayFirstAccessMsg = false;
        this.hideFirstAccessMsg.emit(true);
    }

    emitHideFirstSuperstarMsg() {
        this.displayFirstSuperstarMsg = false;
        this.hideFirstSuperstarMsg.emit(true);
    }

    isItemStarred(): boolean {
        return !Comparator.isEmpty(this.item) && ItemsComparator.isItemStarred(this.item);
    }

    isItemShare(): boolean {
        return ItemsComparator.isItemShare(this.item);
    }

    isItemFlat(): boolean {
        return ItemsComparator.isItemFlat(this.item);
    }

    nextSlide() {
        if (Comparator.isEmpty(this.slides) || this.isItemFlat()) {
            return;
        }

        try {
            this.slides.getActiveIndex().then((index: number) => {
                this.displayAdvertiserAvatar = index > 0;
            });
        } catch (err) {
            this.displayAdvertiserAvatar = false;
        }
    }

    isItemExpire(): boolean {
        return this.displayItemExpire && (this.itemExpiringSoon || this.itemExpired);
    }

    async displayPhotoLightboxModal($event: any) {
        $event.preventDefault();
        $event.stopPropagation();

        const modal: HTMLIonModalElement = await this.modalController.create({
            component: PhotoLightboxModal,
            componentProps: {
                adDisplay: this.adDisplay,
                itemImages: this.itemImages,
                rootUrl: this.RESOURCES.AWS.S3_URL + '/' + this.item.source + '/' + this.item.hashId + '/'
            }
        });

        modal.onDidDismiss().then(() => {
            // Do nothing
        });

        await modal.present();
    }

}
