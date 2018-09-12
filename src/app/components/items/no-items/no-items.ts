import {Component, EventEmitter, Input, Output} from '@angular/core';

// Pages
import {AbstractPage} from '../../../pages/abstract-page';

// Model
import {User} from '../../../services/model/user/user';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {UserSessionService} from '../../../services/core/user/user-session-service';

@Component({
    templateUrl: 'no-items.html',
    styleUrls: ['./no-items.scss'],
    selector: 'app-no-items'
})
export class NoItemsComponent extends AbstractPage {

    @Input() items: any[]; // Item[] oder ItemCard[]

    @Input() loading: boolean = false;

    @Input() label: string;

    @Input() displayAvatarWithOrWithoutItems: boolean = false;

    @Input() displayNoAddress: boolean = false;

    @Output() notifyAction: EventEmitter<{}> = new EventEmitter<{}>();

    user: User;

    constructor(private userSessionService: UserSessionService) {
        super();

        this.user = this.userSessionService.getUser();
    }

    hasItems(): boolean {
        return Comparator.hasElements(this.items);
    }

    doAction() {
        this.notifyAction.emit({});
    }
}
