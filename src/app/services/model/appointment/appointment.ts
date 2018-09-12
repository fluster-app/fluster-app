// Model
import {Item} from '../item/item';
import {Applicant} from './applicant';

// Resources
import {Resources} from '../../core/utils/resources';

export class AppointmentAgendaSchedule {

    when: Date;
    timeFrame: string[];
    status: string;

    constructor() {
        this.timeFrame = new Array<string>();
    }

}

export class AppointmentAgenda {

    _id: string;

    type: string;

    schedule: AppointmentAgendaSchedule[];

    constructor() {
        this.type = Resources.Constants.APPOINTMENT.AGENDA.TYPE.EXACT;
        this.schedule = new Array<AppointmentAgendaSchedule>();
    }

}

export class Appointment {

    _id: string;

    item: Item;

    createdAt: Date;

    type: string;
    attendance: string;
    approval: string;

    agenda: AppointmentAgenda;

    applicant: Applicant[];

    constructor() {
        this.agenda = new AppointmentAgenda();
    }

}

