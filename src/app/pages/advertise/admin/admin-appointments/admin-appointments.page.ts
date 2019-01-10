import {Component, OnInit} from '@angular/core';
import {LoadingController, NavController, Platform, ToastController} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {TranslateService} from '@ngx-translate/core';

// Page
import {AbstractAdminPage} from '../abstract-admin';

// Model
import {Appointment} from '../../../../services/model/appointment/appointment';
import {Item} from '../../../../services/model/item/item';

// Services
import {AppointmentService} from '../../../../services/core/appointment/appointment-service';
import {AdsService} from '../../../../services/advertise/ads-service';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {NavParamsService} from '../../../../services/core/navigation/nav-params-service';
import {AdminAppointmentsService, AdminScheduledDates} from '../../../../services/core/appointment/admin-appoinments-service';

@Component({
    selector: 'app-admin-appointments',
    templateUrl: './admin-appointments.page.html',
    styleUrls: ['./admin-appointments.page.scss'],
})
export class AdminAppointmentsPage extends AbstractAdminPage implements OnInit {

    appointment: Appointment;

    updatedSchedule: number[];

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

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ADS.ADMIN.APPOINTMENTS);
    }

    async ngOnInit() {
        this.item = await this.initItem();

        if (this.item != null) {
            this.appointment = this.item.appointment;

            this.adminScheduledDates = await this.adminAppointmentsService.init(this.item, this.appointment);

            this.loaded = true;
        } else {
            this.loaded = true;
        }
    }

    async updateAppointment() {

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

    private doUpdateAppointment(): Promise<{}> {

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.ADS.ADS, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.ADS.EDIT_APPOINTMENTS);

        return new Promise((resolve, reject) => {
            this.appointmentService.updateAppointmentSchedule(this.appointment, this.updatedSchedule).then((updatedAppointment: Appointment) => {
                resolve(updatedAppointment);
            }, (errorResponse: HttpErrorResponse) => {
                reject(errorResponse);
            });
        });
    }

    private refreshItemAndGoBack(loading: HTMLIonLoadingElement) {
        this.initItem().then(async (item: Item) => {
            if (item != null) {
                this.adsService.setSelectedItem(item);
            }

            await this.navigateBack();
            await loading.dismiss();
        });
    }

    async customBack() {
        await this.navigateBack();
    }

}
