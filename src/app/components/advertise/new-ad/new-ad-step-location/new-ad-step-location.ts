import {Component, Input, Output, EventEmitter, ViewChild, AfterViewInit} from '@angular/core';
import {ModalController, Platform, AlertController, Slides} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';

import {from} from 'rxjs';
import {timeout} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

// Modal
import {SearchLocationModal} from '../../../../modals/core/search-location/search-location';

// Pages
import {AbstractNewAdComponent} from '../abstract-new-ad';
import {TargetedUsersComponent} from '../../targeted-users/targeted-users';

// Model
import {Item, ItemAddress} from '../../../../services/model/item/item';
import {Address} from '../../../../services/model/utils/address';
import {Location} from '../../../../services/model/location/location';

// Resources and utils
import {Comparator} from '../../../../services/core/utils/utils';
import {ItemsComparator} from '../../../../services/core/utils/items-utils';

// Services
import {CurrentLocationService} from '../../../../services/core/location/current-location-service';
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {CurrencyService} from '../../../../services/core/currency/currency-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'new-ad-step-location.html',
    styleUrls: ['./new-ad-step-location.scss'],
    selector: 'app-new-ad-step-location'
})
export class NewAdStepLocationComponent extends AbstractNewAdComponent implements AfterViewInit {

    @ViewChild(TargetedUsersComponent) public targetedUsers: TargetedUsersComponent;

    @Output() notifyPrev: EventEmitter<{}> = new EventEmitter<{}>();

    newItem: Item;

    @Input() slider: Slides;

    constructor(private platform: Platform,
                private modalController: ModalController,
                private alertController: AlertController,
                private translateService: TranslateService,
                private currentLocationService: CurrentLocationService,
                protected newItemService: NewItemService,
                private currencyService: CurrencyService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(newItemService);

        if (this.newItemService.isEdit()) {
            this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService,
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD,
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.STEP_LOCATION);
        }

        this.newItem = this.newItemService.getNewItem();

        this.initLocation();
    }

    ngAfterViewInit() {
        this.targetedUsers.update();
    }

    isItemShare() {
        return ItemsComparator.isItemShare(this.newItem);
    }

    isItemFlat() {
        return ItemsComparator.isItemFlat(this.newItem);
    }

    isAddressNotDefined() {
        return Comparator.isEmpty(this.newItem) || Comparator.isEmpty(this.newItem.address) ||
            Comparator.isEmpty(this.newItem.address.location);
    }

    private initLocation() {

        if (this.isAddressNotDefined()) {
            // Finding current location. Max time we are ok to wait is 10sec, otherwise the user will have to pick a location by himself
            const findLocation = from(this.currentLocationService.findCurrentLocation());

            findLocation
                .pipe(
                    timeout(this.RESOURCES.TIME_OUT.CURRENT_LOCATION)
                )
                .subscribe((currentLocation: Address) => {
                    // We check again if the address is not yet defined in case it took time and the user had selected one
                    if (this.isAddressNotDefined()) {
                        this.updateLocation(currentLocation);
                    }
                }, (err: string) => {
                    // Do nothing
                });
        }
    }

    private updateLocation(locationDetails: Address) {
        if (!Comparator.isEmpty(locationDetails)) {

            const location = new Location();
            location.lng = locationDetails.location.lng;
            location.lat = locationDetails.location.lat;

            this.newItem.address = new ItemAddress();
            this.newItem.address.location = location;

            this.newItem.address.street = locationDetails.street;
            this.newItem.address.zip = locationDetails.zip;
            this.newItem.address.city = locationDetails.city;
            this.newItem.address.district = locationDetails.district;
            this.newItem.address.country = locationDetails.country;

            this.newItem.address.addressName = locationDetails.addressName;

            this.currencyService.initDefaultCurrency(this.newItem.address.country).then(() => {
                // Do nothing here
            });

            this.targetedUsers.update();
        }
    }

    async navigateToSearchLocation() {
        const modal: HTMLIonModalElement = await this.modalController.create({
            component: SearchLocationModal,
            componentProps: {adDisplay: true}
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            if (!Comparator.isEmpty(detail) && !Comparator.isEmpty(detail.data) && detail.data.selectedLocation) {
                this.updateLocation(detail.data.selectedLocation);
            }
        });

        await modal.present();
    }

    next() {
        if (this.isAddressNotDefined()) {
            this.showWarningAddress();
            return;
        }

        this.slider.slideNext();

        this.gaTrackEventOnce(this.platform, this.googleAnalyticsNativeService,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.STEP_LOCATION);
    }

    swipeSlide($event: any) {
        if ($event != null) {
            if ($event.deltaX > 0) {
                // Prev
                this.notifyPrev.emit();
            } else if ($event.deltaX <= 0 && !this.isAddressNotDefined()) {
                // Next
                this.next();
            }
        }
    }

    private async showWarningAddress() {
        const header: string = this.translateService.instant('NEW_AD.STEP_LOCATION.LOCATION_NOT_DEFINED');
        const ok: string = this.translateService.instant('CORE.OK');

        const alert: HTMLIonAlertElement = await this.alertController.create({
            header: header,
            buttons: [ok]
        });

        await alert.present();
    }
}
