import {Injectable} from '@angular/core';

// Model
import {Appointment} from '../../model/appointment/appointment';
import {PickAppointmentExistingDates} from '../../model/utils/pickAppointments';
import {Item} from '../../model/item/item';

// Services
import {AppointmentService} from './appointment-service';


export interface AdminScheduledDates {
    selectedAppointmentsStartTime: number[];
    selectedDates: number[];
    unavailableAppointmentDates: number[];
}

@Injectable({
    providedIn: 'root'
})
export class AdminAppointmentsService {

    constructor(private appointmentService: AppointmentService) {

    }

    init(item: Item, appointment: Appointment): Promise<AdminScheduledDates> {
        return new Promise<AdminScheduledDates>((resolve) => {
            this.appointmentService.buildExistingDates(item, appointment).then((result: PickAppointmentExistingDates) => {
                resolve({
                    selectedAppointmentsStartTime: result.scheduledDates != null ? result.scheduledDates : new Array(),
                    selectedDates: result.scheduledDates != null ? result.scheduledDates : new Array(),
                    unavailableAppointmentDates: result.unavailableAppointmentDates
                });
            });
        });
    }
}