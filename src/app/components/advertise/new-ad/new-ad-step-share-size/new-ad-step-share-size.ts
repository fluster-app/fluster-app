import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {ModalController, Platform, Slides} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';

// Model
import {Item} from '../../../../services/model/item/item';

// Modal
import {SelectAttributesModal} from '../../../../modals/advertise/select-attributes/select-attributes';

// Abstract
import {AbstractNewAdComponent} from '../abstract-new-ad';

// Utils
import {Comparator, Validator} from '../../../../services/core/utils/utils';

// Service
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'new-ad-step-share-size.html',
    styleUrls: ['./new-ad-step-share-size.scss'],
    selector: 'app-new-ad-step-share-size'
})
export class NewAdStepShareSizeComponent extends AbstractNewAdComponent {

    @Output() notifyPrev: EventEmitter<{}> = new EventEmitter<{}>();

    newItem: Item;

    @Input() slider: Slides;

    sizeFormGroup: FormGroup;

    constructor(private platform: Platform,
                private modalController: ModalController,
                protected newItemService: NewItemService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(newItemService);

        this.sizeFormGroup = new FormGroup({
            'sharedSizeValidator': new FormControl('', [], (control: FormControl) => Validator.isNumber(control))
        });

        this.newItem = this.newItemService.getNewItem();

        if (this.newItem && this.newItem.attributes && this.newItem.attributes.sharedRoomsSize > 0) {
            this.sizeFormGroup.setValue({'sharedSizeValidator': this.newItem.attributes.sharedRoomsSize}, {emitEvent: false});
        }
    }

    isSharedroomsSelected() {
        return this.newItem.attributes.sharedRooms > 0;
    }

    isNextAllowed() {
        return !Comparator.isEmpty(this.newItem) && !Comparator.isEmpty(this.newItem.itemDetail) &&
            this.isSharedroomsSelected() && (this.newItem.attributes.sharedRoomsSize == null ||
                Comparator.isStringEmpty('' + this.newItem.attributes.sharedRoomsSize) ||
                Comparator.isNumber(this.newItem.attributes.sharedRoomsSize));
    }

    next() {
        this.slider.slideNext();

        this.gaTrackEventOnce(this.platform, this.googleAnalyticsNativeService,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.STEP_SHARE_SIZE);
    }

    async navigateToSharedRoomsSelection() {
        const increment: number = this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.INCREMENT.SHARED_ROOM;
        const maxValue: number = this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.MAX_SELECTABLE_ROOMS;

        const modal: HTMLIonModalElement = await this.modalController.create({
            component: SelectAttributesModal,
            componentProps: {
                initialValue: this.newItem.attributes.sharedRooms,
                title: 'SELECT_ATTRIBUTES.SHARED_ROOMS_TEXT',
                labelSingular: 'SELECT_ATTRIBUTES.SHARED_ROOM',
                labelPlural: 'SELECT_ATTRIBUTES.SHARED_ROOMS',
                increment: increment,
                maxValue: maxValue
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            this.newItem.attributes.sharedRooms = detail.data;
        });

        await modal.present();
    }

    swipeSlide($event: any) {
        if ($event != null) {
            if ($event.deltaX > 0) {
                // Prev
                this.notifyPrev.emit();
            } else if ($event.deltaX <= 0 && this.isNextAllowed()) {
                // Next
                this.next();
            }
        }
    }

    updateSharedRoomsSize(size: number) {
        this.newItem.attributes.sharedRoomsSize = size;
    }
}
