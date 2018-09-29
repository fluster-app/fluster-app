import {NavController} from '@ionic/angular';

// Abstract
import {AbstractPage} from '../../abstract-page';

// Model
import {Item} from '../../../services/model/item/item';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {AdsService} from '../../../services/advertise/ads-service';
import {AdminAppointmentsNavParams, NavParamsService} from '../../../services/core/navigation/nav-params-service';

export abstract class AbstractAdminPage extends AbstractPage {

    item: Item;

    constructor(protected navController: NavController,
                protected adsService: AdsService,
                protected navParamsService: NavParamsService) {
        super();

    }

    protected initItem(): Promise<Item> {
        return new Promise<Item>((resolve) => {
            // Always refresh the item to be sure to have the last one
            this.adsService.findAdsItems().then((items: Item[]) => {
                resolve(Comparator.isEmpty(items) ? null : items[0]);
            }, (err: any) => {
                resolve(null);
            });
        });
    }

    protected async getNavigationToDetails(): Promise<boolean> {
        const navParams: AdminAppointmentsNavParams = await this.navParamsService.getAdminAppointmentsNavParams();
        if (navParams && navParams.menuToggle) {
            return this.navController.navigateRoot('/ads-details');
        } else {
            return this.navController.navigateBack('/ads-details');
        }
    }
}