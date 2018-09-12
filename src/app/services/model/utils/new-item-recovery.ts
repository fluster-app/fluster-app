import {Item} from '../item/item';
import {Appointment} from '../appointment/appointment';
import {Photo} from './photo';

export interface NewItemRecovery {

    edit: boolean;
    newItem: Item;
    newAppointment: Appointment;
    photos: Photo[];

}
