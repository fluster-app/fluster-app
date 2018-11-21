import {Component, OnInit} from '@angular/core';
import {LoadingController, NavController, Platform, ToastController} from '@ionic/angular';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

// Page
import {AbstractAdminPage} from '../abstract-admin';

// Model
import {Item} from '../../../../services/model/item/item';

// Utils
import {Converter, Comparator} from '../../../../services/core/utils/utils';

// Services
import {AppointmentService} from '../../../../services/core/appointment/appointment-service';
import {AdsService} from '../../../../services/advertise/ads-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {NavParamsService} from '../../../../services/core/navigation/nav-params-service';

@Component({
    selector: 'app-admin-extend',
    templateUrl: './admin-extend.page.html',
    styleUrls: ['./admin-extend.page.scss'],
})
export class AdminExtendPage extends AbstractAdminPage implements OnInit {

    extendItem: string = 'true';
    extendDate: Date;
    extendDateDisplay: string;
    itemEndThePast: boolean = false;

    loaded: boolean = false;

    constructor(private platform: Platform,
                protected navController: NavController,
                private loadingController: LoadingController,
                private toastController: ToastController,
                private translateService: TranslateService,
                private appointmentService: AppointmentService,
                protected adsService: AdsService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                protected navParamsService: NavParamsService) {
        super(navController, adsService, navParamsService);

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ADS.ADMIN.APPOINTMENTS);
    }

    async ngOnInit() {
        this.item = await this.initItem();

        await this.computeExtendDates();
    }

    private computeExtendDates(): Promise<void> {
        return new Promise<void>((resolve) => {
            let today: Date = new Date();
            today = moment(today).startOf('day').toDate();

            this.extendDate = moment(today).add(this.RESOURCES.ITEM.END.DAYS_EXTEND, 'd').toDate();
            this.extendDateDisplay = moment(this.extendDate).format('ll');

            this.itemEndThePast = Converter.getDateObj(this.item.end).getTime() <= today.getTime();

            resolve();
        });
    }

    async updateAd() {
        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.ADS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.EDIT_END);

        const loading: HTMLIonLoadingElement = await this.loadingController.create({});

        await loading.present();

        try {
            if (this.extendItem != null && Comparator.equals(this.extendItem, 'true')) {
                const updatedItem: Item = await this.adsService.setEnd(this.item._id, this.extendDate);
                this.adsService.setSelectedItem(updatedItem);
            }

            await this.navigateBack();

            await loading.dismiss();
        } catch (err) {
            await loading.dismiss();
            await this.errorMsg(this.toastController, this.translateService, 'ERRORS.WIZARD.NOT_ADDED');
        }
    }

}
