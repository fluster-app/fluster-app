import {Component, Input} from '@angular/core';

// Pages
import {AbstractPage} from '../../../pages/abstract-page';

// Model
import {User} from '../../../services/model/user/user';

@Component({
    templateUrl: 'advertiser-info.html',
    styleUrls: ['./advertiser-info.scss'],
    selector: 'app-advertiser-info'
})
export class AdvertiserInfoComponent extends AbstractPage {

    @Input() user: User;

    @Input() displayAvatar: boolean = true;

    @Input() starred: boolean = false;

    constructor() {
        super();
    }

}
