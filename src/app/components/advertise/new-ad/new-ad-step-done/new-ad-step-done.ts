import {Component, Input, Output, EventEmitter, AfterViewInit, OnDestroy} from '@angular/core';
import {Platform, IonSlides} from '@ionic/angular';

import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';

import {Subscription} from 'rxjs';

// Pages
import {AbstractNewAdComponent} from '../abstract-new-ad';

// Model
import {Reward} from '../../../../services/model/reward/reward';

// Utils
import {Comparator} from '../../../../services/core/utils/utils';

// Service
import {NewItemService} from '../../../../services/advertise/new-item-service';

@Component({
    templateUrl: 'new-ad-step-done.html',
    styleUrls: ['./new-ad-step-done.scss'],
    selector: 'app-new-ad-step-done'
})
export class NewAdStepDoneComponent extends AbstractNewAdComponent implements AfterViewInit, OnDestroy {

    @Output() notifiyGoToAdDetailCall: EventEmitter<void> = new EventEmitter<void>();

    @Output() notifiyGoToCandidatesCall: EventEmitter<void> = new EventEmitter<void>();

    @Output() notifiyGoToAdminAppointments: EventEmitter<void> = new EventEmitter<void>();

    @Output() notifiyGoToAdminLimitation: EventEmitter<void> = new EventEmitter<void>();

    @Input() slider: IonSlides;

    confetti: number[];

    sliderSubscription: Subscription;

    constructor(
        private platform: Platform,
        private inAppBrowser: InAppBrowser,
        protected newItemService: NewItemService) {

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

    navigateToCandidates() {
        this.notifiyGoToCandidatesCall.emit();
    }

    navigateToAdminAppointments() {
        this.notifiyGoToAdminAppointments.emit();
    }

    navigateToAdminLimitation() {
        this.notifiyGoToAdminLimitation.emit();
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

        this.inAppBrowser.create(reward.prize.termsUrl, '_blank', 'location=no,shouldPauseOnSuspend=yes');
    }
}
