import {Component, OnInit, ViewChild} from '@angular/core';

import {Card} from 'ionic-swing';

// Abstract
import {AbstractModal} from '../../core/abstract-modal';

// Model
import {Applicant} from '../../../services/model/appointment/applicant';
import {Item} from '../../../services/model/item/item';
import {ItemUser} from '../../../services/model/item/item-user';

// Resources and utils
import {Comparator} from '../../../services/core/utils/utils';
import {ItemsComparator} from '../../../services/core/utils/items-utils';

// Services
import {LastItemsService} from '../../../services/browse/last-items-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {ModalController, NavParams, Platform, Slides} from '@ionic/angular';
import {InitScheduledDates, ItemAppointmentService} from '../../../services/core/appointment/item-appointment-service';

@Component({
    templateUrl: 'item-appointments.html',
    styleUrls: ['./item-appointments.scss'],
    selector: 'app-item-appointments'
})
export class ItemAppointmentsModal extends AbstractModal implements OnInit {

    item: Item;
    itemUser: ItemUser;
    itemSwingCard: Card;

    existingApplicant: Applicant;

    alreadyBookmarked: boolean = false;

    initScheduledDates: InitScheduledDates;

    loaded: boolean = false;

    constructor(private platform: Platform,
                private navParams: NavParams,
                private modalController: ModalController,
                private lastItemsService: LastItemsService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private itemAppointmentService: ItemAppointmentService) {

        super();

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.BROWSE.ITEM_APPOINTMENTS);
    }

    async ngOnInit() {
        this.initItem();

        this.initScheduledDates = await this.itemAppointmentService.init(this.item, this.existingApplicant);

        this.loaded = true;
    }

    private initItem() {
        this.item = this.navParams.get('item');
        this.itemUser = this.navParams.get('itemUser');
        this.itemSwingCard = this.navParams.get('itemSwingCard');

        const bookmarked: boolean = this.navParams.get('bookmarked');
        this.alreadyBookmarked = bookmarked != null && bookmarked;

        this.existingApplicant = this.navParams.get('applicant');
    }

    navigateToItems() {
        // Calendar added, item like, this item should not displayed anymore
        if (this.itemSwingCard) {
            this.itemSwingCard.destroy();
        }

        this.lastItemsService.removeItem();
        this.lastItemsService.displayCompleteProfileMsg = true;

        this.close(true);
    }

    close(success: boolean) {
        this.modalController.dismiss(success).then(() => {
            // Do nothing
        });
    }

    isItemShare(): boolean {
        return ItemsComparator.isItemShare(this.item);
    }

    isItemFlat(): boolean {
        return ItemsComparator.isItemFlat(this.item);
    }

    useUserTitle(): boolean {
        return !Comparator.isEmpty(this.item) && !Comparator.isEmpty(this.item.user.facebook) && !Comparator.isStringEmpty(this.item.user.facebook.firstName);
    }
}
