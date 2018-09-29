import {Component, OnInit, ViewChild} from '@angular/core';
import {LoadingController, NavController, Platform, Slides, ToastController} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {forkJoin, Subscription} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

// Page
import {AbstractAdminPage} from '../abstract-admin';

// Model
import {Appointment} from '../../../../services/model/appointment/appointment';
import {Item} from '../../../../services/model/item/item';

// Utils
import {Converter, Comparator} from '../../../../services/core/utils/utils';
import {ItemsComparator} from '../../../../services/core/utils/items-utils';

// Services
import {AppointmentService} from '../../../../services/core/appointment/appointment-service';
import {AdsService} from '../../../../services/advertise/ads-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {AdminAppointmentsNavParams, NavParamsService} from '../../../../services/core/navigation/nav-params-service';
import {AdminAppointmentsService, AdminScheduledDates} from '../../../../services/core/appointment/admin-appoinments-service';

@Component({
    selector: 'app-admin-appointments',
    templateUrl: './admin-appointments.page.html',
    styleUrls: ['./admin-appointments.page.scss'],
})
export class AdminAppointmentsPage extends AbstractAdminPage implements OnInit {

    @ViewChild('adsAdminAppointmentsSlider') slider: Slides;

    private customBackActionSubscription: Subscription;

    itemEndCouldBeExtended: boolean = false;

    appointment: Appointment;

    // First slide

    updatedSchedule: number[];
    menuToggle: boolean = false;

    // Second slide

    extendItem: string = 'true';
    extendDate: Date;
    extendDateDisplay: string;
    itemEndThePast: boolean = false;

    adminScheduledDates: AdminScheduledDates;

    loaded: boolean = false;

    constructor(private platform: Platform,
                protected navController: NavController,
                private loadingController: LoadingController,
                private toastController: ToastController,
                private translateService: TranslateService,
                private appointmentService: AppointmentService,
                protected adsService: AdsService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                protected navParamsService: NavParamsService,
                private adminAppointmentsService: AdminAppointmentsService) {
        super(navController, adsService, navParamsService);

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ADS.ADS_CLOSE);
    }

    async ngOnInit() {
        this.item = await this.initItem();

        if (this.item != null) {
            this.appointment = this.item.appointment;

            const promises = new Array();
            promises.push(this.computeExtendDates());
            promises.push(this.adminAppointmentsService.init(this.item, this.appointment));

            forkJoin(promises).subscribe(([empty, adminScheduledDates]: [void, AdminScheduledDates]) => {
                this.adminScheduledDates = adminScheduledDates;

                this.loaded = true;
            });
        } else {
            this.loaded = true;
        }
    }

    async ionViewWillEnter() {
        this.overrideHardwareBackAction();

        await this.displayMenuToggle();
    }

    ionViewDidLeave() {
        if (this.customBackActionSubscription) {
            this.customBackActionSubscription.unsubscribe();
        }

        this.navParamsService.setAdminAppointmentsNavParams(null);
    }

    private overrideHardwareBackAction() {
        this.platform.ready().then(() => {
            this.customBackActionSubscription = this.platform.backButton.subscribe(() => {
                this.backToPreviousSlide();
            });
        });
    }

    async backToPreviousSlide() {
        if (this.slider != null) {
            const activeIndex: number = await this.slider.getActiveIndex();

            if (activeIndex > 0) {
                this.slider.slidePrev();
                await this.displayMenuToggle();
            } else {
                await this.navigateToDetails();
            }
        } else {
            await this.navigateToDetails();
        }
    }

    private async displayMenuToggle() {
        let activeIndex: number = 0;

        try {
            if (this.slider) {
                activeIndex = await this.slider.getActiveIndex();
            }
        } catch (err) {
            // On init the slider may not exist yet
        }

        const navParams: AdminAppointmentsNavParams = await this.navParamsService.getAdminAppointmentsNavParams();

        this.menuToggle = activeIndex === 0 && navParams && navParams.menuToggle;
    }

    private async navigateToDetails() {
        await this.getNavigationToDetails();
    }

    private computeExtendDates(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.itemEndCouldBeExtended = ItemsComparator.isItemExpiringSoon(this.item);

            let today: Date = new Date();
            today = moment(today).startOf('day').toDate();

            this.extendDate = moment(today).add(this.RESOURCES.ITEM.END.DAYS_EXTEND, 'd').toDate();
            this.extendDateDisplay = moment(this.extendDate).format('ll');

            this.itemEndThePast = Converter.getDateObj(this.item.end).getTime() <= today.getTime();

            resolve();
        });
    }

    async next() {
        await this.slider.update();
        this.slider.slideNext();
    }

    private async updateAppointment() {

        const loading: HTMLIonLoadingElement = await this.loadingController.create({});

        loading.present().then(() => {
            this.doUpdateAppointment().then(() => {
                this.refreshItemAndGoBack(loading);
            }, async (error: HttpErrorResponse) => {
                await loading.dismiss();
                await this.errorMsg(this.toastController, this.translateService, 'ERRORS.WIZARD.NOT_ADDED');
            });
        });
    }

    select(selectedDates: number[]) {
        this.updatedSchedule = selectedDates;
    }

    extendItemAndUpdateAppointment() {
        if (this.itemEndCouldBeExtended && this.extendItem != null && Comparator.equals(this.extendItem, 'true')) {
            this.doExtendItemAndUpdateAppointment();
        } else {
            this.updateAppointment();
        }
    }

    private async doExtendItemAndUpdateAppointment() {

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.ADS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.EXTEND);

        const loading: HTMLIonLoadingElement = await this.loadingController.create({});

        loading.present().then(() => {

            const promises = new Array();

            promises.push(this.adsService.setEnd(this.item._id, this.extendDate));
            promises.push(this.doUpdateAppointment());

            forkJoin(promises).subscribe(
                (data: any[]) => {
                    this.item = data[0];
                    this.refreshItemAndGoBack(loading);
                },
                async (err: any) => {
                    await loading.dismiss();
                    await this.errorMsg(this.toastController, this.translateService, 'ERRORS.WIZARD.NOT_ADDED');
                }
            );
        });
    }

    private doUpdateAppointment(): Promise<{}> {

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.ADS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.EDIT_END);

        return new Promise((resolve, reject) => {
            this.appointmentService.updateAppointmentSchedule(this.appointment, this.updatedSchedule).then((updatedAppointment: Appointment) => {
                resolve(updatedAppointment);
            }, (errorResponse: HttpErrorResponse) => {
                reject(errorResponse);
            });
        });
    }

    private refreshItemAndGoBack(loading: HTMLIonLoadingElement) {
        this.initItem().then((item: Item) => {
            if (item != null) {
                this.adsService.setSelectedItem(item);
            }

            this.getNavigationToDetails().then(async () => {
                await loading.dismiss();
            }, async (err: any) => {
                await loading.dismiss();
            });
        });
    }

}
