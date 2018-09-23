import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Platform, Slides} from '@ionic/angular';

// Model
import {Item} from '../../../../services/model/item/item';

// Pages
import {AbstractNewAdComponent} from '../abstract-new-ad';

// Utils
import {ItemsComparator} from '../../../../services/core/utils/items-utils';

// Services
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'new-ad-step-type.html',
    selector: 'app-new-ad-step-type'
})
export class NewAdStepTypeComponent extends AbstractNewAdComponent {

    @Output() notifyPrev: EventEmitter<{}> = new EventEmitter<{}>();

    newItem: Item;

    @Input() slider: Slides;

    isSharePicked: boolean = false;
    isTakeoverPicked: boolean = false;

    constructor(private platform: Platform,
                protected newItemService: NewItemService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(newItemService);

        this.newItem = this.newItemService.getNewItem();
    }

    flatSharing() {
        this.pickShare();

        this.setTypeAndNavigate(this.RESOURCES.ITEM.TYPE.SHARE);
    }

    takeover() {
        this.pickTakeover();

        this.setTypeAndNavigate(this.RESOURCES.ITEM.TYPE.TAKEOVER);
    }

    pickShare() {
        this.isSharePicked = true;
    }

    pickTakeover() {
        this.isTakeoverPicked = true;
    }

    private setTypeAndNavigate(type: string) {
        this.newItem.attributes.type = type;

        // In case of WG, init with the first increment aka one room
        if (ItemsComparator.isItemShare(this.newItem)) {
            this.newItem.itemDetail.flatmate = this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.DEFAULT_FLATMATE;
            this.newItem.attributes.sharedRooms = this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.INCREMENT.SHARE;
        } else {
            this.newItem.itemDetail.flatmate = null;
            this.newItem.attributes.sharedRooms = null;
            this.newItem.attributes.sharedRoomsSize = null;
        }

        this.newItem.itemDetail.bathrooms = this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.DEFAULT_BATHROOMS;

        setTimeout(() => {
            this.slider.slideNext();

            this.gaTrackEventOnce(this.platform, this.googleAnalyticsNativeService,
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD,
                this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.STEP_TYPE);

            // Reset if user comeback
            this.isSharePicked = false;
            this.isTakeoverPicked = false;
        }, 400);
    }

    swipeSlide($event: any) {
        if ($event != null) {
            if ($event.deltaX > 0) {
                // Prev
                this.notifyPrev.emit();
            }

            // First step with two choices, therefore can't swipe next
        }
    }

}
