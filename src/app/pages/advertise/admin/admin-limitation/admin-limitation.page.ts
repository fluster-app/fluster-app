import {Component, OnInit} from '@angular/core';
import {Platform, NavController, LoadingController, ToastController} from '@ionic/angular';

import {TranslateService} from '@ngx-translate/core';

// Abstract
import {AbstractAdminPage} from '../abstract-admin';

// Model
import {Item} from '../../../../services/model/item/item';

// Utils
import {ItemsComparator} from '../../../../services/core/utils/items-utils';
import {Comparator} from '../../../../services/core/utils/utils';

// Services
import {AdsService} from '../../../../services/advertise/ads-service';
import {AdminAppointmentsNavParams, NavParamsService} from '../../../../services/core/navigation/nav-params-service';
import {SelectedAges} from '../../../../components/advertise/new-ad/new-ad-step-limitation/new-ad-step-limitation';
import {GoogleAnalyticsNativeService} from '../../../../services/native/analytics/google-analytics-native-service';
import {NewItemService} from '../../../../services/advertise/new-item-service';

@Component({
    selector: 'app-admin-limitation',
    templateUrl: './admin-limitation.page.html',
    styleUrls: ['./admin-limitation.page.scss'],
})
export class AdminLimitationPage extends AbstractAdminPage implements OnInit {

    menuToggle: boolean = false;

    ages: SelectedAges = {
        lower: this.RESOURCES.ITEM.USER_RESTRICTIONS.AGE.MIN,
        upper: this.RESOURCES.ITEM.USER_RESTRICTIONS.AGE.MAX
    };

    male: boolean = true;
    female: boolean = true;

    loaded: boolean = false;

    constructor(private platform: Platform,
                protected navController: NavController,
                private loadingController: LoadingController,
                private toastController: ToastController,
                private translateService: TranslateService,
                protected navParamsService: NavParamsService,
                protected adsService: AdsService,
                private newItemService: NewItemService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService) {
        super(navController, adsService, navParamsService);

        this.gaTrackView(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.VIEW.ADS.ADS_CLOSE);
    }

    async ngOnInit() {
        this.item = await this.initItem();

        this.init();

        this.loaded = true;
    }

    async ionViewWillEnter() {
        const navParams: AdminAppointmentsNavParams = await this.navParamsService.getAdminAppointmentsNavParams();

        this.menuToggle = navParams && navParams.menuToggle;
    }

    private init() {
        if (Comparator.isEmpty(this.item)) {
            return;
        }

        this.ages = {lower: this.item.userLimitations.age.min, upper: this.item.userLimitations.age.max};

        this.male = true;
        this.female = true;

        if (this.item.userLimitations.gender === this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.MALE) {
            this.female = false;
        } else if (this.item.userLimitations.gender === this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.FEMALE) {
            this.male = false;
        }
    }

    isItemShare() {
        return ItemsComparator.isItemShare(this.item);
    }

    isItemFlat() {
        return ItemsComparator.isItemFlat(this.item);
    }

    onAgeChange(ev: Range) {
        this.item.userLimitations.age.min = this.ages.lower;
        this.item.userLimitations.age.max = this.ages.upper;
    }

    onGenderChange() {
        this.updateItemGender();
    }

    private updateItemGender() {
        if (this.male && this.female) {
            this.item.userLimitations.gender = this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.IRRELEVANT;
        } else if (this.male) {
            this.item.userLimitations.gender = this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.MALE;
        } else if (this.female) {
            this.item.userLimitations.gender = this.RESOURCES.ITEM.USER_RESTRICTIONS.GENDER.FEMALE;
        }
    }

    async updateAd() {
        const loading: HTMLIonLoadingElement = await this.loadingController.create({});

        await loading.present();

        try {
            this.updateItemGender();

            const updatedItem: Item = await this.newItemService.updateItem(this.item);
            this.adsService.setSelectedItem(updatedItem);

            await this.getNavigationToDetails();

            await loading.dismiss();
        } catch (err) {
            await loading.dismiss();
            await this.errorMsg(this.toastController, this.translateService, 'ERRORS.WIZARD.NOT_ADDED');
        }
    }

}
