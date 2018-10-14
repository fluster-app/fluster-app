import {Component, ViewChild, ElementRef, NgZone, ViewEncapsulation} from '@angular/core';
import {LoadingController, ModalController, NavParams, Platform, ToastController} from '@ionic/angular';

import {Device} from '@ionic-native/device/ngx';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {Camera, CameraOptions, CameraPopoverOptions} from '@ionic-native/camera/ngx';
import {WebView} from '@ionic-native/ionic-webview/ngx';

import {TranslateService} from '@ngx-translate/core';

import Cropper from 'cropperjs';

// Modal
import {AbstractWizardModal} from '../abstract-wizard-modal';

// Resouces
import {Comparator, Converter} from '../../../services/core/utils/utils';

// Services
import {LocalFilesService} from '../../../services/native/localfiles/local-files-service';
import {NewItemService} from '../../../services/advertise/new-item-service';
import {LoginService} from '../../../services/core/login/login-service';
import {NewItemRecovery} from '../../../services/model/utils/new-item-recovery';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'photo-picker.html',
    styleUrls: ['./photo-picker.scss'],
    selector: 'app-photo-picker',
    encapsulation: ViewEncapsulation.None
})
export class PhotoPickerModal extends AbstractWizardModal {

    isGalleryPicked: boolean = false;
    isCameraPicked: boolean = false;

    index: number;

    imgURI: string = null;

    private cropper: Cropper;
    cropperReady: boolean = false;

    @ViewChild('photoPicker', {read: ElementRef}) content: ElementRef;

    filter: string = null;

    filterInitialized: boolean = false;

    webGLDetected: boolean = false;
    croppedImgFilterSrc: string = null;

    // Stencil component not yet supported on Android
    // See: https://github.com/ionic-team/stencil/issues/517
    // Also we don't want to display filters on old iPhone
    @ViewChild('imageSrc', {read: ElementRef}) input: ElementRef;
    advanceMode: boolean = false;

    iOS: boolean = true;

    displayImgSelector: boolean = true;

    constructor(protected platform: Platform,
                private splashScreen: SplashScreen,
                private modalController: ModalController,
                private loadingController: LoadingController,
                private navParams: NavParams,
                private toastController: ToastController,
                private zone: NgZone,
                private camera: Camera,
                private webView: WebView,
                private device: Device,
                private translateService: TranslateService,
                private loginService: LoginService,
                private localFilesService: LocalFilesService,
                private newItemService: NewItemService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(platform);

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.PHOTO_PICKER);

        this.iOS = this.platform.is('ios');

        // No Instagram filters for PWA. Doesn't work well when input byte array on mobile devices
        this.advanceMode = this.ENV_CORDOVA ? (!this.iOS ? this.isAdvancedModeAndroid() : this.isAdvancedModeIOS()) : false;

        this.displayImgSelector = this.ENV_CORDOVA;
    }

    ionViewWillEnter() {
        this.index = this.navParams.get('index');

        this.checkAdDisplayParams(this.navParams);

        this.resetPicked();

        this.retrievePendingAndroidRecovery();

        this.loadFileImage();
    }

    private cleanup() {
        if (this.cropper != null) {
            this.cropper.destroy();
        }

        this.imgURI = null;

        if (this.platform.is('ios')) {
            this.camera.cleanup().then(() => {
                // Do nothing
            }, (err) => {
                // We ignore. The camera may have not been use, in such a case, on Android, an error gonna be thrown
            });
        }
    }

    private retrievePendingAndroidRecovery() {
        if (this.platform.is('android') && this.newItemService.hasPendingAndroidPhotoRecoveryURI()) {
            // There was a restart on Android because of low memory
            this.imgURI = this.newItemService.popAndroidPhotoRecoveryURI() + '?' + Math.random();

            this.hideSplashScreen(this.platform, this.splashScreen, this.loginService);
        }
    }

    // Use in case of PWA
    private loadFileImage() {
        const imageFileParam: File = this.navParams.get('fileImage');

        if (imageFileParam != null) {
            Converter.firstFileToBase64(imageFileParam).then((result: string) => {
                this.imgURI = result;
            }, (err: any) => {
                // Ignore error, do nothing
            });
        }
    }

    private saveForRecovery(): Promise<{}> {
        return new Promise((resolve) => {
            if (this.platform.is('android')) {
                this.newItemService.saveAndroidRecovery().then((recover: NewItemRecovery) => {
                    resolve();
                });
            } else {
                resolve();
            }
        });

    }

    resetPicked() {
        this.isGalleryPicked = false;
        this.isCameraPicked = false;
    }

    takePhoto() {
        this.pickCamera();

        //noinspection TypeScriptUnresolvedVariable
        this.getPicture(this.camera.PictureSourceType.CAMERA);
    }

    choosePhoto() {
        this.pickGallery();

        //noinspection TypeScriptUnresolvedVariable
        this.getPicture(this.camera.PictureSourceType.PHOTOLIBRARY);
    }

    pickCamera() {
        this.isCameraPicked = true;
    }

    pickGallery() {
        this.isGalleryPicked = true;
    }

    private getPicture(sourceType: number) {
        this.saveForRecovery().then(() => {
            this.executeGetPicture(sourceType);
        });
    }

    private executeGetPicture(sourceType: number) {
        //noinspection TypeScriptUnresolvedVariable
        const popoverOptions: CameraPopoverOptions = {
            x: 250,
            y: 430,
            width: 100,
            height: 200,
            arrowDir: this.camera.PopoverArrowDirection.ARROW_LEFT
        };

        // we set the quality to cordova to 100. later with the cropper we gonna reduce it to 92%
        // we target a with/height a bit bigger than the later goal of 1080x1080
        // noinspection TypeScriptUnresolvedVariable
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            sourceType: sourceType,
            allowEdit: false,
            encodingType: this.camera.EncodingType.JPEG,
            targetWidth: 1280,
            targetHeight: 1280,
            mediaType: this.camera.MediaType.PICTURE,
            correctOrientation: true,
            saveToPhotoAlbum: false,
            cameraDirection: this.camera.Direction.BACK,
            popoverOptions: popoverOptions
        };

        this.camera.getPicture(options).then((imageURI: string) => {
            this.imgURI = this.webView.convertFileSrc(imageURI) + '?' + Math.random();

            this.resetPicked();
        }, (err: string) => {
            // Back is also an error 'Selection cancelled.' or 'Camera cancelled.'
            this.resetPicked();
        });
    }

    // Web Photo Filter

    imageLoaded($event: any) {

        if ($event == null) {
            return;
        }

        if (!this.filterInitialized) {
            // Init just once
            this.webGLDetected = $event.detail.webGLDetected;
        }

        const cropBox: Cropper.CropBoxData = this.detroyCropper();

        this.initCropper($event, cropBox);
    }

    private detroyCropper(): Cropper.CropBoxData {
        let cropBox: Cropper.CropBoxData = null;

        if (!Comparator.isEmpty(this.cropper)) {
            cropBox = this.cropper.getCropBoxData();
            this.cropper.destroy();
        }

        return cropBox;
    }

    private initCropper($event: any, cropBox: Cropper.CropBoxData) {
        this.cropper = new Cropper($event.detail.result, {
            viewMode: 2,
            aspectRatio: 1,
            dragMode: <any> 'move',
            modal: true,
            guides: false,
            highlight: true,
            background: true,
            autoCrop: true,
            autoCropArea: 0.9,
            responsive: true,
            minContainerWidth: this.content.nativeElement.clientWidth,
            minContainerHeight: this.content.nativeElement.clientHeight,
            ready: (event: CustomEvent) => {

                this.cropperReady = true;

                this.initFilterSrcImg();

                // In case the user move the cropBox, move it to is previous size and place
                if (cropBox != null) {
                    this.cropper.setCropBoxData(cropBox);
                }
            }
        });
    }

    private initFilterSrcImg() {
        if (!this.filterInitialized) {
            const filterCropBox: Cropper.CropBoxData = this.cropper.getCropBoxData();

            // To display the filters, we gonna use max an image of 60px width
            const filterWidth: number = 60;
            const filterHeight: number = filterCropBox.height * filterWidth / filterCropBox.width;

            this.croppedImgFilterSrc = this.cropper.getCroppedCanvas({
                width: filterWidth,
                height: filterHeight
            }).toDataURL(this.RESOURCES.PHOTO.MIME_TYPE, this.RESOURCES.PHOTO.JPG_QUALITY);
        }

        this.filterInitialized = true;
    }

    // Without Web Photo Filter aka for Android

    imageLoadedWithoutFilters() {
        this.cropper = new Cropper(this.input.nativeElement, {
            viewMode: 2,
            aspectRatio: 1,
            dragMode: <any> 'move',
            modal: true,
            guides: false,
            highlight: true,
            background: true,
            autoCrop: true,
            autoCropArea: 0.9,
            responsive: true,
            minContainerWidth: this.content.nativeElement.clientWidth,
            minContainerHeight: this.content.nativeElement.clientHeight,
            ready: (event: CustomEvent) => {

                // Zone for iPhone 4/5
                this.zone.run(() => {
                    this.cropperReady = true;
                });
            }
        });
    }

    async select() {
        const loading: HTMLIonLoadingElement = await this.loadingController.create({});

        loading.present().then(() => {
            const croppedImgURI: string = this.cropper.getCroppedCanvas({
                width: 1080,
                height: 1080
            }).toDataURL(this.RESOURCES.PHOTO.MIME_TYPE, this.RESOURCES.PHOTO.JPG_QUALITY);

            this.localFilesService.writeFile(croppedImgURI).then((localImgURI: string) => {
                this.modalController.dismiss({imgURI: localImgURI, index: this.index}).then(async () => {
                    this.cleanup();
                    await loading.dismiss();
                });
            }, async (err: any) => {
                await loading.dismiss();
                await this.errorMsg(this.toastController, this.translateService, 'ERRORS.WIZARD.PHOTO_NOT_WRITTEN');
            });
        });
    }

    close() {
        this.modalController.dismiss().then(() => {
            this.cleanup();
        });
    }

    zoom(zoom: boolean) {
        this.cropper.zoom(zoom ? 0.1 : -0.1);
    }

    applyFilter(filterToApply: string) {
        if (!this.cropperReady) {
            return;
        }

        if (!Comparator.equals(this.filter, filterToApply)) {
            this.filter = filterToApply;
            this.cropperReady = false;

            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.PHOTO_APPLY_FILTER);
        }
    }

    private isAdvancedModeIOS(): boolean {

        //removeIf(production)
        if (!this.device.model) {
            return true;
        }
        //endRemoveIf(production)

        if (Comparator.isStringEmpty(this.device.model)) {
            return false;
        }

        // No Filter on iPhone < 6
        // See https://www.theiphonewiki.com/wiki/Models for model list
        // iPhone 5s = iPhone6,1 or iPhone 6,2
        if (this.device.model.indexOf('iPhone1') > -1 ||
            this.device.model.indexOf('iPhone2') > -1 ||
            this.device.model.indexOf('iPhone3') > -1 ||
            this.device.model.indexOf('iPhone4') > -1 ||
            this.device.model.indexOf('iPhone5') > -1 ||
            this.device.model.indexOf('iPhone6') > -1) {
            return false;
        }

        return true;
    }

    private isAdvancedModeAndroid(): boolean {

        //removeIf(production)
        if (!this.device.version) {
            return true;
        }
        //endRemoveIf(production)

        if (Comparator.isStringEmpty(this.device.version)) {
            return false;
        }

        if (this.device.version.length < 1) {
            return false;
        }

        if (this.device.version.startsWith('1') ||
            this.device.version.startsWith('2') ||
            this.device.version.startsWith('3') ||
            this.device.version.startsWith('4') ||
            this.device.version.startsWith('5') ||
            this.device.version.startsWith('6')) {
            return false;
        }

        return true;
    }

    //removeIf(production)
    dummyPhoto() {
        this.imgURI = 'assets/img/login/login-slide1.png' + '?' + Math.random();
    }

    //endRemoveIf(production)
}
