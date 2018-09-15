import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Platform, Slides} from '@ionic/angular';

// Model
import {Item, ItemDetailParking} from '../../../../services/model/item/item';

// Pages
import {AbstractNewAdComponent} from '../abstract-new-ad';

// Utils
import {ItemsComparator} from '../../../../services/core/utils/items-utils';

// Service
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'new-ad-step-attributes.html',
    styleUrls: ['./new-ad-step-attributes.scss'],
    selector: 'app-new-ad-step-attributes'
})
export class NewAdStepAttributesComponent extends AbstractNewAdComponent {

    @Output() notifyPrev: EventEmitter<{}> = new EventEmitter<{}>();

    @Output() notifyNext: EventEmitter<{}> = new EventEmitter<{}>();

    newItem: Item;

    @Input() slider: Slides;

    internet: boolean = false;
    cleaningAgent: boolean = false;
    parking: boolean = false;
    balcony: boolean = false;
    garden: boolean = false;

    constructor(private platform: Platform,
                protected newItemService: NewItemService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(newItemService);

        this.newItem = this.newItemService.getNewItem();

        this.updateItem(this.newItem);
    }

    private updateItem(updateItem: Item) {
        this.newItem = updateItem;

        if (this.newItem.itemDetail != null) {
            if (this.newItem.itemDetail.tags != null) {
                this.internet = this.newItem.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.INTERNET) > -1;
                this.cleaningAgent = this.newItem.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.CLEANING_AGENT) > -1;
                this.garden = this.newItem.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.GARDEN) > -1;
                this.balcony = this.newItem.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.BALCONY) > -1;
            }

            this.parking = this.newItem.itemDetail.parking != null;
        }
    }

    next() {
        this.newItem.itemDetail.tags = new Array();

        if (this.internet) {
            this.newItem.itemDetail.tags.push(this.RESOURCES.ITEM.DETAIL.TAGS.INTERNET);
        } else if (this.newItem.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.INTERNET) > -1) {
            this.newItem.itemDetail.tags.splice(this.newItem.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.INTERNET), 1);
        }

        if (this.cleaningAgent) {
            this.newItem.itemDetail.tags.push(this.RESOURCES.ITEM.DETAIL.TAGS.CLEANING_AGENT);
        } else if (this.newItem.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.CLEANING_AGENT) > -1) {
            this.newItem.itemDetail.tags.splice(this.newItem.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.CLEANING_AGENT), 1);
        }

        if (this.garden) {
            this.newItem.itemDetail.tags.push(this.RESOURCES.ITEM.DETAIL.TAGS.GARDEN);
        } else if (this.newItem.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.GARDEN) > -1) {
            this.newItem.itemDetail.tags.splice(this.newItem.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.GARDEN), 1);
        }

        if (this.balcony) {
            this.newItem.itemDetail.tags.push(this.RESOURCES.ITEM.DETAIL.TAGS.BALCONY);
        } else if (this.newItem.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.BALCONY) > -1) {
            this.newItem.itemDetail.tags.splice(this.newItem.itemDetail.tags.indexOf(this.RESOURCES.ITEM.DETAIL.TAGS.BALCONY), 1);
        }

        if (this.newItem.itemDetail.tags.length === 0) {
            this.newItem.itemDetail.tags = null;
        }

        if (this.parking) {
            this.newItem.itemDetail.parking = new ItemDetailParking();
            this.newItem.itemDetail.parking.type = this.RESOURCES.ITEM.DETAIL.PARKING.TYPE.PARKING_SPACE;
            this.newItem.itemDetail.parking.included = true;
        } else {
            this.newItem.itemDetail.parking = null;
        }

        this.notifyNext.emit();

        // TODO: Remove params, Ionic bug https://github.com/ionic-team/ionic/issues/15604
        this.slider.slideNext(500, true);

        this.gaTrackEventOnce(this.platform, this.googleAnalyticsNativeService,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.STEP_PHOTO);
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

    isItemShare() {
        return ItemsComparator.isItemShare(this.newItem);
    }

    isItemFlat() {
        return ItemsComparator.isItemFlat(this.newItem);
    }
}
