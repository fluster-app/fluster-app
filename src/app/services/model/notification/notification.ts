// Model
import {User} from '../user/user';
import {Item} from '../item/item';
import {Appointment} from '../appointment/appointment';
import {Applicant} from '../appointment/applicant';

export class Notification {
    _id: string;

    userTo: User;
    userFrom: User;
    item: Item;
    appointment: Appointment;
    applicant: Applicant;

    type: string;
    read: boolean;

    createdAt: Date;
    updatedAt: Date;

}
