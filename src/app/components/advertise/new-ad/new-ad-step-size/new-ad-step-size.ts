import {Component, Input, EventEmitter, Output} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {ModalController, Platform, Slides} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';

// Modal
import {SelectAttributesModal} from '../../../../modals/advertise/select-attributes/select-attributes';
import {SelectFloorModal} from '../../../../modals/advertise/select-floor/select-floor';

// Model
import {Item} from '../../../../services/model/item/item';

// Abstract
import {AbstractNewAdComponent} from '../abstract-new-ad';

// Utils
import {Comparator, Validator} from '../../../../services/core/utils/utils';
import {ItemsComparator} from '../../../../services/core/utils/items-utils';

// Service
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'new-ad-step-size.html',
    styleUrls: ['./new-ad-step-size.scss'],
    selector: 'app-new-ad-step-size'
})
export class NewAdStepSizeComponent extends AbstractNewAdComponent {

    @Output() notifyPrev: EventEmitter<{}> = new EventEmitter<{}>();

    @Output() notifyNext: EventEmitter<{}> = new EventEmitter<{}>();

    newItem: Item;

    @Input() slider: Slides;

    sizeFormGroup: FormGroup;

    constructor(private platform: Platform,
                private modalController: ModalController,
                protected newItemService: NewItemService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(newItemService);

        this.sizeFormGroup = new FormGroup({
            'sizeValidator': new FormControl('', [], (control: FormControl) => Validator.isNumber(control))
        });

        this.newItem = this.newItemService.getNewItem();

        if (this.newItem && this.newItem.attributes && this.newItem.attributes.size > 0) {
            this.sizeFormGroup.setValue({'sizeValidator': this.newItem.attributes.size}, {emitEvent: false});
        }
    }

    isItemShare() {
        return ItemsComparator.isItemShare(this.newItem);
    }

    isItemFlat() {
        return ItemsComparator.isItemFlat(this.newItem);
    }

    isRoomsSelected() {
        return this.newItem.attributes.rooms > 0;
    }

    isBathroomsSelected() {
        return this.newItem.itemDetail.bathrooms != null;
    }

    isFloorSelected() {
        return this.newItem.itemDetail.floor != null;
    }

    isNextAllowed() {
        return !Comparator.isEmpty(this.newItem) && !Comparator.isEmpty(this.newItem.attributes) &&
            (this.isRoomsSelected() || this.isItemShare()) && (this.newItem.attributes.size == null ||
                Comparator.isStringEmpty('' + this.newItem.attributes.size) || Comparator.isNumber(this.newItem.attributes.size));
    }

    next() {
        this.notifyNext.emit();

        this.slider.slideNext();

        this.gaTrackEventOnce(this.platform, this.googleAnalyticsNativeService,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.STEP_SIZE);
    }

    async navigateToRoomSelection() {
        const increment: number = (this.areHalfRoomsAllowed() ? this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.INCREMENT.FLAT_CH : this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.INCREMENT.FLAT);
        const maxValue: number = this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.MAX_SELECTABLE_ROOMS;

        const modal: HTMLIonModalElement = await this.modalController.create({
            component: SelectAttributesModal,
            componentProps: {
                initialValue: this.newItem.attributes.rooms,
                title: 'SELECT_ATTRIBUTES.ROOMS_TEXT',
                labelSingular: 'SELECT_ATTRIBUTES.ROOM',
                labelPlural: 'SELECT_ATTRIBUTES.ROOMS',
                increment: increment,
                maxValue: maxValue
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            this.newItem.attributes.rooms = detail.data;
        });

        await modal.present();
    }

    private areHalfRoomsAllowed(): boolean {
        return !Comparator.isEmpty(this.newItem.address) && !Comparator.isStringEmpty(this.newItem.address.country) &&
            (Comparator.equals(this.newItem.address.country, 'CH') ||
                Comparator.equals(this.newItem.address.country, 'DE') ||
                Comparator.equals(this.newItem.address.country, 'AT'));
    }

    async navigateToFloorSelection() {
        const modal: HTMLIonModalElement = await this.modalController.create({
            component: SelectFloorModal,
            componentProps: {
                initialValue: this.newItem.itemDetail.floor,
                currentFloor: this.newItem.itemDetail.floor
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            this.newItem.itemDetail.floor = detail.data;
        });

        await modal.present();
    }

    async navigateToBathroomsSelection() {
        const increment: number = this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.INCREMENT.BATHROOMS;
        const maxValue: number = this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.MAX_SELECTABLE_BATHROOMS;
        const minValue: number = this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.MIN_BATHROOMS;

        const modal: HTMLIonModalElement = await this.modalController.create({
            component: SelectAttributesModal,
            componentProps: {
                initialValue: this.newItem.itemDetail.bathrooms,
                title: 'SELECT_ATTRIBUTES.BATHROOMS_TEXT',
                labelSingular: 'SELECT_ATTRIBUTES.BATHROOM',
                labelPlural: 'SELECT_ATTRIBUTES.BATHROOMS',
                increment: increment,
                maxValue: maxValue,
                minValue: minValue
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            this.newItem.itemDetail.bathrooms = detail.data;
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

    isFlatmateSelected() {
        return this.newItem.itemDetail.flatmate > 0;
    }

    async navigateToFlatmateSelection() {
        const increment: number = this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.INCREMENT.FLATMATE;
        const maxValue: number = this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.MAX_SELECTABLE_FLATMATE;
        const minValue: number = this.RESOURCES.ITEM.DETAIL.ATTRIBUTES.DEFAULT_FLATMATE;

        const modal: HTMLIonModalElement = await this.modalController.create({
            component: SelectAttributesModal,
            componentProps: {
                initialValue: this.newItem.itemDetail.flatmate,
                title: 'SELECT_ATTRIBUTES.FLATMATE_TEXT',
                labelSingular: 'SELECT_ATTRIBUTES.FLATMATE',
                labelPlural: 'SELECT_ATTRIBUTES.FLATMATES',
                increment: increment,
                maxValue: maxValue,
                minValue: minValue
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            this.newItem.itemDetail.flatmate = detail.data;
        });

        await modal.present();
    }

    updateSize(size: number) {
        this.newItem.attributes.size = size;
    }

}
