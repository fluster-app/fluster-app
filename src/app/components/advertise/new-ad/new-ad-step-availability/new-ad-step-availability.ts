import {Component, Input, ViewChild, Output, EventEmitter, NgZone} from '@angular/core';
import {ModalController, Platform, Slides} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';

import * as moment from 'moment';

// Modal
import {DatePickerModal} from '../../../../modals/core/date-picker/date-picker';

// Model
import {Item} from '../../../../services/model/item/item';

// Utils
import {Comparator, Converter} from '../../../../services/core/utils/utils';
import {ItemsComparator} from '../../../../services/core/utils/items-utils';

// Pages
import {AbstractNewAdComponent} from '../abstract-new-ad';
import {TargetedUsersComponent} from '../../targeted-users/targeted-users';

// Service
import {NewItemService} from '../../../../services/advertise/new-item-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';

@Component({
    templateUrl: 'new-ad-step-availability.html',
    styleUrls: ['./new-ad-step-availability.scss'],
    selector: 'app-new-ad-step-availability'
})
export class NewAdStepAvailabilityComponent extends AbstractNewAdComponent {

    @Output() notifyPrev: EventEmitter<{}> = new EventEmitter<{}>();

    @Output() notifyNext: EventEmitter<{}> = new EventEmitter<{}>();

    @ViewChild(TargetedUsersComponent) public targetedUsers: TargetedUsersComponent;

    newItem: Item;

    @Input() slider: Slides;

    availableNow: boolean;
    unlimited: boolean = true;

    constructor(private platform: Platform,
                private modalController: ModalController,
                protected newItemService: NewItemService,
                private zone: NgZone,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(newItemService);
        this.newItem = this.newItemService.getNewItem();

        this.updateItem(this.newItem);
    }

    private updateItem(updateItem: Item) {
        this.newItem = updateItem;

        this.availableNow = this.newItem.attributes.availability.begin == null ||
            this.isToday(Converter.getDateObj(this.newItem.attributes.availability.begin));
        this.unlimited = this.newItem.attributes.availability.end == null;
    }

    private isToday(whichDate: Date): boolean {
        if (whichDate == null) {
            return false;
        }

        return moment(whichDate).isSame(moment(new Date()), 'd');
    }

    isItemShare() {
        return ItemsComparator.isItemShare(this.newItem);
    }

    isItemFlat() {
        return ItemsComparator.isItemFlat(this.newItem);
    }

    isBeginDateSelected() {
        return !Comparator.isEmpty(this.newItem) && !Comparator.isEmpty(this.newItem.attributes) &&
            !Comparator.isEmpty(this.newItem.attributes.availability) && this.newItem.attributes.availability.begin != null;
    }

    isEndDateSelected() {
        return !Comparator.isEmpty(this.newItem) && !Comparator.isEmpty(this.newItem.attributes) &&
            !Comparator.isEmpty(this.newItem.attributes.availability) && this.newItem.attributes.availability.end != null;
    }

    next() {
        if (this.availableNow) {
            this.newItem.attributes.availability.begin = moment(new Date()).startOf('day').toDate();
        }

        if (this.unlimited) {
            this.newItem.attributes.availability.end = null;
        }

        this.notifyNext.emit();

        this.slider.slideNext();

        this.gaTrackEventOnce(this.platform, this.googleAnalyticsNativeService,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.WIZARD,
            this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.WIZARD.STEP_AVAILABILITY);
    }

    isNextAllowed(): boolean {
        return (this.availableNow || this.isBeginDateSelected()) && (this.unlimited || this.isEndDateSelected());
    }

    async openModal(forBeginDate: boolean) {
        const dateValue: Date = forBeginDate ? this.newItem.attributes.availability.begin : this.newItem.attributes.availability.end;

        const modal: HTMLIonModalElement = await this.modalController.create({
            component: DatePickerModal,
            componentProps: {
                adDisplay: true,
                value: dateValue
            }
        });

        modal.onDidDismiss().then((detail: OverlayEventDetail) => {
            if (detail !== null && detail.data != null) {
                if (forBeginDate) {
                    this.newItem.attributes.availability.begin = detail.data;
                } else {
                    this.newItem.attributes.availability.end = detail.data;
                }

                this.targetedUsers.update();
            }
        });

        await modal.present();
    }

    // https://forum.ionicframework.com/t/ion-toggle-ionchange-triggered
    private isSlideActive(): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            if (!this.slider) {
                resolve(false);
            } else {
                try {
                    const index: number = await this.slider.getActiveIndex();
                    const result: boolean = (this.newItemService.isEdit() ? index === 2 : index === 3);
                    resolve(result);
                } catch (err) {
                    resolve(false);
                }
            }
        });
    }

    updateAvailableNow() {
        this.isSlideActive().then((slideActive: boolean) => {
            if (slideActive) {
                this.zone.run(() => {
                    this.availableNow = !this.availableNow;

                    // If availableNow was false and we go back to true
                    if (!this.availableNow) {
                        this.newItem.attributes.availability.begin = null;

                        this.targetedUsers.update();
                    }
                });
            }
        });
    }

    updateUnlimited() {
        this.isSlideActive().then((slideActive: boolean) => {
            if (slideActive) {
                this.zone.run(() => {
                    this.unlimited = !this.unlimited;

                    // If unlimited was false and we go back to true
                    if (!this.unlimited) {
                        this.newItem.attributes.availability.end = null;

                        this.targetedUsers.update();
                    }
                });
            }
        });
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
}
