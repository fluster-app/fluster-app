import {Component, Input, Output, EventEmitter, AfterViewInit, OnDestroy} from '@angular/core';
import {LoadingController, Platform, Slides} from '@ionic/angular';

import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';

import {Subscription} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

// Pages
import {AbstractNewAdComponent} from '../abstract-new-ad';

// Model
import {Reward} from '../../../../services/model/reward/reward';

// Utils
import {Comparator} from '../../../../services/core/utils/utils';

// Model
import {Item} from '../../../../services/model/item/item';

// Service
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {CurrencyService} from '../../../../services/core/currency/currency-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'new-ad-step-done.html',
    styleUrls: ['./new-ad-step-done.scss'],
    selector: 'app-new-ad-step-done'
})
export class NewAdStepDoneComponent extends AbstractNewAdComponent implements AfterViewInit, OnDestroy {

    @Output() notifiyGoToAdDetailCall: EventEmitter<void> = new EventEmitter<void>();

    @Output() notifiyGoToAdminAppointments: EventEmitter<void> = new EventEmitter<void>();

    @Output() notifiyGoToAdminLimitation: EventEmitter<void> = new EventEmitter<void>();

    @Input() slider: Slides;

    confetti: number[];

    sliderSubscription: Subscription;

    constructor(
        private platform: Platform,
        private inAppBrowser: InAppBrowser,
        private socialSharing: SocialSharing,
        private loadingController: LoadingController,
        private translateService: TranslateService,
        private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
        protected newItemService: NewItemService,
        private currencyService: CurrencyService) {

        super(newItemService);
    }

    ngAfterViewInit(): void {
        if (this.slider) {
            this.sliderSubscription = this.slider.ionSlideDidChange.subscribe(() => {
                if (this.newItemService.isDone() && !this.isEdit()) {
                    this.confetti = Array.from({length: 100}, (v, k) => k + 1);
                }
            });
        }
    }


    ngOnDestroy() {
        if (this.sliderSubscription != null) {
            this.sliderSubscription.unsubscribe();
        }
    }

    navigateToAdDetail() {
        this.notifiyGoToAdDetailCall.emit();
    }

    navigateToAdminAppointments() {
        this.notifiyGoToAdminAppointments.emit();
    }

    navigateToAdminLimitation() {
        this.notifiyGoToAdminLimitation.emit();
    }

    shareAd() {
        const item: Item = this.newItemService.getNewItem();

        this.shareItem(this.platform, this.socialSharing, this.googleAnalyticsNativeService,
            this.loadingController, this.translateService, this.currencyService, item).then(() => {
            // Do nothing
        }, (err: any) => {
            // Do nothing
        });
    }

    hasReward(): boolean {
        return !Comparator.isEmpty(this.newItemService.getReward());
    }

    openTermsOfConditions() {
        if (!this.hasReward()) {
            return;
        }

        const reward: Reward = this.newItemService.getReward();

        if (Comparator.isEmpty(reward.prize)) {
            return;
        }

        this.inAppBrowser.create(reward.prize.termsUrl, '_blank', 'location=no');
    }
}
