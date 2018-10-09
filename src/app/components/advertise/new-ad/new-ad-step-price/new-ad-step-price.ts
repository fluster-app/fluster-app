import {Component, Input, Output, EventEmitter, ViewChild, AfterViewInit} from '@angular/core';
import {Platform, AlertController, Slides} from '@ionic/angular';

import {debounceTime} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

// Model
import {Item} from '../../../../services/model/item/item';

// Pages
import {AbstractNewAdComponent} from '../abstract-new-ad';

// Utils
import {Comparator, Validator, Converter} from '../../../../services/core/utils/utils';
import {ItemsComparator} from '../../../../services/core/utils/items-utils';

// Service
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {FormGroup, FormControl} from '@angular/forms';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {TargetedUsersComponent} from '../../targeted-users/targeted-users';

@Component({
    templateUrl: 'new-ad-step-price.html',
    styleUrls: ['./new-ad-step-price.scss'],
    selector: 'app-new-ad-step-price'
})
export class NewAdStepPriceComponent extends AbstractNewAdComponent implements AfterViewInit {

    @ViewChild(TargetedUsersComponent) public targetedUsers: TargetedUsersComponent;

    @Output() notifyPrev: EventEmitter<{}> = new EventEmitter<{}>();

    @Output() notifyNext: EventEmitter<{}> = new EventEmitter<{}>();

    newItem: Item;

    @Input() slider: Slides;

    additionalCosts: boolean = false;

    priceFormGroup: FormGroup;

    gross: string;
    charges: string;

    constructor(private platform: Platform,
                private alertController: AlertController,
                private translateService: TranslateService,
                protected newItemService: NewItemService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(newItemService);

        this.priceFormGroup = new FormGroup({
            'priceValidator': new FormControl('', [], (control: FormControl) => Validator.isNumber(control)),
            'chargesValidator': new FormControl('', [], (control: FormControl) => Validator.isNumber(control))
        });

        this.newItem = this.newItemService.getNewItem();

        this.additionalCosts = this.newItem.attributes.price.net != null;

        if (this.additionalCosts) {
            this.gross = this.newItem.attributes.price.net != null ? '' + this.newItem.attributes.price.net : '';
            this.charges = this.newItem.attributes.price.charges != null ? '' + this.newItem.attributes.price.charges : '';
        } else {
            this.gross = this.newItem.attributes.price.gross != null && this.newItem.attributes.price.gross > 0 ?
                '' + this.newItem.attributes.price.gross : '';
            this.charges = '';
        }

        this.priceFormGroup.setValue({'priceValidator': this.gross, 'chargesValidator': this.charges});
    }

    ngAfterViewInit(): void {

        this.priceFormGroup.valueChanges
            .pipe(
                debounceTime(700)
            )
            .subscribe((validators: any) => {
                if (!Comparator.isNumberNullOrZero(this.newItem.attributes.price.gross) && this.newItem.attributes.price.gross >= 100) {
                    this.targetedUsers.update();
                }
            });

        // After init
        this.targetedUsers.update();
    }

    isItemShare() {
        return ItemsComparator.isItemShare(this.newItem);
    }

    isItemFlat() {
        return ItemsComparator.isItemFlat(this.newItem);
    }

    private isNextAllowed() {
        return !Comparator.isEmpty(this.newItem) && this.isPriceDefined();
    }

    private isPriceDefined() {
        return !Comparator.isEmpty(this.newItem.attributes) && Comparator.isBiggerThanZero(this.gross) &&
            (!this.additionalCosts || Comparator.isBiggerThanZero(this.charges));
    }

    updatePrice(newPrice: string) {
        this.gross = newPrice;

        if (this.additionalCosts) {
            this.newItem.attributes.price.charges = Converter.roundCurrency(this.charges);
            this.newItem.attributes.price.net = Converter.roundCurrency(this.gross);
            this.newItem.attributes.price.gross = Converter.roundCurrency('' +
                (this.newItem.attributes.price.net + this.newItem.attributes.price.charges));

            this.gross = this.newItem.attributes.price.net > 0 ? '' + this.newItem.attributes.price.net : '';
        } else {
            this.newItem.attributes.price.gross = Converter.roundCurrency(this.gross);
            this.newItem.attributes.price.charges = null;
            this.newItem.attributes.price.net = null;

            this.gross = this.newItem.attributes.price.gross > 0 ? '' + this.newItem.attributes.price.gross : '';
        }

        this.charges = this.newItem.attributes.price.charges > 0 ? '' + this.newItem.attributes.price.charges : '';
    }

    updateCharges(newCharges: string) {
        this.charges = newCharges;

        this.updatePrice(this.gross);
    }

    async next() {
        if (!this.isNextAllowed()) {
            await this.showWarningPrice();
            return;
        }

        this.updatePrice(this.gross);

        this.notifyNext.emit();

        this.slider.slideNext();

        this.gaTrackEventOnce(this.platform, this.googleAnalyticsNativeService,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.STEP_PRICE);
    }

    private async showWarningPrice() {
        const header: string = this.translateService.instant('NEW_AD.STEP_PRICE.PRICE_NOT_DEFINED');
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

    resetCharges() {
        if (this.additionalCosts && !Comparator.isStringEmpty(this.charges)) {
            this.charges = '';
        }
    }
}
