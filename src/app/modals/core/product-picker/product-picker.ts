import {Component, OnInit} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {NavParams, Platform, PopoverController} from '@ionic/angular';

import {TranslateService} from '@ngx-translate/core';

import {SwiperOptions} from 'swiper';

// Modal
import {AbstractModal} from '../abstract-modal';

// Model
import {Product} from '../../../services/model/product/product';

// Tools
import {Comparator} from '../../../services/core/utils/utils';

// Service
import {ProductService} from '../../../services/core/product/product-service';
import {LoginService} from '../../../services/core/login/login-service';
import {SubscriptionService} from '../../../services/core/user/subscription-service';
import {Subscription} from '../../../services/model/user/user';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {FacebookNativeService} from '../../../services/native/facebook/facebook-native-service';

@Component({
    templateUrl: 'product-picker.html',
    styleUrls: ['./product-picker.scss'],
    selector: 'app-product-picker'
})
export class ProductPickerPopover extends AbstractModal implements OnInit {

    slideOptsAutoplay: SwiperOptions = {
        autoplay: {
            delay: 4000
        }
    };

    product: Product;

    loaded: boolean = false;
    shareInProgress: boolean = false;
    shareDone: boolean = false;

    subscription: Subscription;

    constructor(private platform: Platform,
                private popoverController: PopoverController,
                private navParams: NavParams,
                private facebookNativeService: FacebookNativeService,
                private translateService: TranslateService,
                private productService: ProductService,
                private loginService: LoginService,
                private subscriptionService: SubscriptionService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super();

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.PRODUCT_PICKER);
    }

    ngOnInit() {
        this.loadProducts();
        this.subscription = this.subscriptionService.getSubscription();
    }

    ionViewWillEnter() {
        this.checkAdDisplayParams(this.navParams);
    }

    private loadProducts() {
        this.productService.findProducts(!this.isAdDisplay).then((product: Product[]) => {
            this.product = Comparator.hasElements(product) ? product[0] : null;
            this.loaded = true;
        }, (errorResponse: HttpErrorResponse) => {
            this.product = null;
            this.loaded = true;
        });
    }

    close() {
        this.loginService.setInteracting(false);

        const result: boolean = this.subscriptionService.isSubscriptionActive();

        this.popoverController.dismiss(result).then(() => {
            // Do nothing
        });
    }

    shareFlusterFacebook() {
        this.shareFluster();
    }

    private shareFluster() {
        this.shareInProgress = true;

        this.loginService.setInteracting(true);

        this.shareForProduct();
    }

    private shareForProduct() {
        const text: string = this.translateService.instant('APP_PARAMS.SHARE.SHARE_CONTENT');

        this.facebookNativeService.getSocialSharing(text, this.getHashtag()).then((result: any) => {
            this.createSubscription();
        }, (errorMsg: string) => {
            this.shareDone = false;
            this.shareInProgress = false;
        });
    }

    private createSubscription() {
        const status: string = this.product.price.free.enabled && !this.product.price.free.needAcknowledgement ? this.RESOURCES.PRODUCT.STATUS.ACTIVE : this.RESOURCES.PRODUCT.STATUS.INITIALIZED;

        this.productService.createSubscription(this.product, status).then(() => {
            this.shareDone = true;
            this.shareInProgress = false;
            // Don't updated this.subscription because we want to display the inquiry mask
        }, (errorMsg: string) => {
            this.shareDone = false;
            this.shareInProgress = false;
        });
    }

    getHashtag(): string {
        return Comparator.isStringEmpty(this.product.price.free.hashtag) ? this.RESOURCES.SOCIAL_SHARING.FLUSTER_SHARE_DEFAULT_HASHTAG : this.product.price.free.hashtag;
    }

    hasSubscription(): boolean {
        return !Comparator.isEmpty(this.subscription);
    }

    isDurationDays(): boolean {
        return Comparator.equals(this.RESOURCES.PRODUCT.DURATION.TYPE.DAYS, this.product.duration.duration);
    }
}
