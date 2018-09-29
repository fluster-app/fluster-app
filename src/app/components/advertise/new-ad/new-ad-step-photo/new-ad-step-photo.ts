import {Component, Input, Output, EventEmitter, SimpleChange, OnChanges, ViewChild, ElementRef} from '@angular/core';
import {ModalController, Platform, AlertController, Slides} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';

import {WebView} from '@ionic-native/ionic-webview/ngx';

import {TranslateService} from '@ngx-translate/core';

// Modal
import {PhotoPickerModal} from '../../../../modals/core/photo-picker/photo-picker';

// Model
import {Photo} from '../../../../services/model/utils/photo';
import {Item} from '../../../../services/model/item/item';

// Pages
import {AbstractNewAdComponent} from '../abstract-new-ad';

// Resources
import {Comparator} from '../../../../services/core/utils/utils';
import {ItemsComparator} from '../../../../services/core/utils/items-utils';

// Services
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'new-ad-step-photo.html',
    styleUrls: ['./new-ad-step-photo.scss'],
    selector: 'app-new-ad-step-photo'
})
export class NewAdStepPhotoComponent extends AbstractNewAdComponent implements OnChanges {

    @Output() notifyPrev: EventEmitter<{}> = new EventEmitter<{}>();

    newItem: Item;

    @Input() slider: Slides;

    @Input() openPicker: boolean = false;

    photos: Photo[];

    sourceIndex: string = null;

    @ViewChild('pwaphoto', {read: ElementRef}) pwaphoto: ElementRef;
    private pwaIndex: number;

    constructor(private platform: Platform,
                private modalController: ModalController,
                private alertController: AlertController,
                private webView: WebView,
                private translateService: TranslateService,
                protected newItemService: NewItemService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(newItemService);

        this.newItem = this.newItemService.getNewItem();

        this.photos = this.newItemService.getPhotos();
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (!Comparator.isEmpty(changes['openPicker']) && changes['openPicker'].currentValue) {
            if (this.newItemService.hasPendingAndroidPhotoRecoveryURI()) {
                // There was a restart on Android because of low memory
                this.findNextPhotoIndex().then((photoIndex: number) => {
                    this.openPhotoPicker(photoIndex);
                });
            }
        }
    }

    removePhoto($event: any, index: number) {
        // Prevent calling (don't call) parent click
        $event.preventDefault();
        $event.stopPropagation();

        this.photos.splice(index, 1);

        if (index === 0) {
            this.newItem.mainPhoto = null;

            if (Comparator.hasElements(this.newItem.itemDetail.otherPhotos)) {
                this.newItem.mainPhoto = this.newItem.itemDetail.otherPhotos[0];
                this.newItem.itemDetail.otherPhotos.splice(0, 1);
            }
        } else {
            this.newItem.itemDetail.otherPhotos.splice(index - 1, 1);
        }
    }

    isSelectedAsSource(index: number): boolean {
        return this.sourceIndex != null && index === parseInt(this.sourceIndex, 0);
    }

    navigateToPhotoPicker($event: any, index: number) {
        // Prevent calling (don't call) parent click
        $event.preventDefault();
        $event.stopPropagation();

        if (this.hasPhoto(index)) {
            if (this.sourceIndex == null) {
                this.sourceIndex = '' + index;
            } else if (Comparator.equals(this.sourceIndex, '' + index)) {
                this.sourceIndex = null;
            } else {
                this.swap(index);
            }

            return;
        }

        if (!this.isNextPhoto(index)) {
            // Photo need to be deleted first before being able to add one
            // Futhermore, photo have to be added in a specific order
            return;
        }

        if (this.ENV_CORDOVA && this.platform.is('cordova')) {
            this.openPhotoPicker(index);
        } else {
            this.openPWAPhotoPicker(index);
        }
    }

    private async openPhotoPicker(index: number, pwaFileImage?: File) {

        const modalParam: any = {index: index, adDisplay: true};

        if (pwaFileImage != null) {
            modalParam['fileImage'] = pwaFileImage;
        }

        const modal: HTMLIonModalElement = await this.modalController.create({
            component: PhotoPickerModal,
            componentProps: modalParam
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            if (!Comparator.isEmpty(detail) && !Comparator.isEmpty(detail.data)) {
                this.photoUpdate(detail.data.imgURI, detail.data.index);
            }
        });

        await modal.present();
    }

    private swap(destinationIndex: number) {
        const tmp: string = this.photos[destinationIndex].imgURI;
        const tmpNew: boolean = this.photos[destinationIndex].newPhoto;

        const srcIndex: number = parseInt(this.sourceIndex, 0);

        this.photos[destinationIndex].imgURI = this.photos[srcIndex].imgURI;
        this.photos[destinationIndex].newPhoto = this.photos[srcIndex].newPhoto;

        this.photos[srcIndex].imgURI = tmp;
        this.photos[srcIndex].newPhoto = tmpNew;

        this.swapItemPhoto(srcIndex, destinationIndex);

        this.sourceIndex = null;
    }

    private swapItemPhoto(srcIndex: number, destinationIndex: number) {
        const destName: string = destinationIndex === 0 ? this.newItem.mainPhoto :
            this.newItem.itemDetail.otherPhotos[destinationIndex - 1];

        if (srcIndex === 0) {
            this.newItem.itemDetail.otherPhotos[destinationIndex - 1] = this.newItem.mainPhoto;
            this.newItem.mainPhoto = destName;
        } else {
            if (destinationIndex === 0) {
                this.newItem.mainPhoto = this.newItem.itemDetail.otherPhotos[srcIndex - 1];
            } else {
                this.newItem.itemDetail.otherPhotos[destinationIndex - 1] = this.newItem.itemDetail.otherPhotos[srcIndex - 1];
            }

            this.newItem.itemDetail.otherPhotos[srcIndex - 1] = destName;
        }
    }

    private photoUpdate(imgURI: string, index: number) {
        if (Comparator.isStringEmpty(imgURI)) {
            return;
        }

        this.photos[index] = new Photo(imgURI, index, true);

        const imgName = Date.now();

        // Save photo name in model
        if (index === 0) {
            this.newItem.mainPhoto = imgName + this.RESOURCES.PHOTO.IMG_EXTENSION;
        } else if (Comparator.isEmpty(this.newItem.itemDetail.otherPhotos)) {
            this.newItem.itemDetail.otherPhotos = new Array<string>();

            this.newItem.itemDetail.otherPhotos[0] = imgName + this.RESOURCES.PHOTO.IMG_EXTENSION;
        } else {
            this.newItem.itemDetail.otherPhotos[index - 1] = imgName + this.RESOURCES.PHOTO.IMG_EXTENSION;
        }
    }

    isRemovable(index: number): boolean {
        if (!this.isActionAllowed()) {
            return false;
        }

        return this.hasPhoto(index);
    }

    hasPhoto(index: number): boolean {
        return this.photos[index] != null && this.photos[index].imgURI !== undefined;
    }

    isNextPhoto(index: number): boolean {
        if (!this.isActionAllowed()) {
            return false;
        }

        return index === 0 ? !this.hasPhoto(index) : this.hasPhoto(index - 1) && !this.hasPhoto(index);
    }

    private isActionAllowed(): boolean {
        // No photo could be added or deleted when swap gonna be done
        return this.sourceIndex == null;
    }

    private isNextAllowed(): boolean {
        return this.hasPhoto(0) && this.isActionAllowed();
    }

    next() {
        if (!this.isNextAllowed()) {
            this.showWarningOnePhoto();
            return;
        }

        this.newItemService.setPhotos(this.photos);

        this.slider.slideNext();

        this.gaTrackEventOnce(this.platform, this.googleAnalyticsNativeService,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.STEP_PHOTO);
    }

    private async showWarningOnePhoto() {
        const labelKey: string = this.isItemFlat() ? 'NEW_AD.STEP_PHOTO.AT_LEAST_ONE_PHOTO_FLAT' : 'NEW_AD.STEP_PHOTO.AT_LEAST_ONE_PHOTO_SHARE';

        const header: string = this.translateService.instant(labelKey);
        const ok: string = this.translateService.instant('CORE.OK');

        const alert: HTMLIonAlertElement = await this.alertController.create({
            header: header,
            buttons: [ok]
        });

        await alert.present();
    }

    swipeSlide($event: any) {
        if ($event != null) {
            if ($event.deltaX > 0) {
                // Prev
                this.notifyPrev.emit();
            } else if ($event.deltaX <= 0) {
                // Next
                this.next();
            }
        }
    }

    wkWebViewFileURI(uri: string) {
        return this.ENV_CORDOVA && this.platform.is('cordova') ? this.webView.convertFileSrc(uri) : uri;
    }

    private findNextPhotoIndex(): Promise<{}> {
        return new Promise((resolve) => {
            resolve(this.nextPhotoIndex());
        });
    }

    private nextPhotoIndex(): number {
        if (Comparator.hasElements(this.photos)) {
            for (let i: number = 0; i < this.photos.length; i++) {
                if (!this.hasPhoto(i)) {
                    return i;
                }
            }
        }

        return 0;
    }

    //removeIf(production)
    dummyNext() {
        this.newItem.mainPhoto = 'mockup.jpg';
        this.newItem.itemDetail.otherPhotos = null;
        this.photos.push(new Photo('mockup.jpg', 0, false));

        this.newItemService.setPhotos(this.photos);

        this.slider.slideNext();
    }

    //endRemoveIf(production)

    // PWA

    private openPWAPhotoPicker(index: number) {
        this.pwaIndex = index;

        if (this.pwaphoto == null) {
            return;
        }

        this.pwaphoto.nativeElement.value = null;
        this.pwaphoto.nativeElement.click();
    }

    uploadPWA() {

        if (this.pwaphoto == null) {
            return;
        }

        const fileList: FileList = this.pwaphoto.nativeElement.files;

        if (fileList && fileList.length > 0) {
            this.openPhotoPicker(this.pwaIndex, fileList[0]);
        }
    }

    isItemFlat() {
        return ItemsComparator.isItemFlat(this.newItem);
    }

    isItemShare() {
        return ItemsComparator.isItemShare(this.newItem);
    }
}
