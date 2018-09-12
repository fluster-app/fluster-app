// Model
import {User} from '../user/user';
import {Item} from '../item/item';
import {Appointment} from './appointment';

export class ApplicantAgenda {

    _id: string;

    when: Date;
    status: string;
}

export class ApplicantCancellation {

    reason: string;

    constructor(_reason: string) {
        this.reason = _reason;
    }

}

export class Applicant {

    _id: string;

    appointment: Appointment;

    user: User;

    item: Item;

    createdAt: Date;

    status: string;

    agenda: ApplicantAgenda[];

    selected: Date;

    cancellation: ApplicantCancellation;

    updatedAt: Date;

    constructor(_appointment: Appointment, _user: User, _item: Item) {
        this.appointment = _appointment;
        this.user = _user;
        this.item = _item;

        this.agenda = new Array<ApplicantAgenda>();
    }

}
