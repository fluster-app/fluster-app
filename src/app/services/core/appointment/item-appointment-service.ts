import {Injectable} from '@angular/core';

import {forkJoin} from 'rxjs';

// Model
import {Item} from '../../model/item/item';
import {Applicant} from '../../model/appointment/applicant';

// Utils
import {Comparator, Converter} from '../utils/utils';

// Services
import {AppointmentService} from './appointment-service';
import {StorageService} from '../localstorage/storage-service';

export interface InitScheduledDates {
    advertiserDates: number[];
    unavailableAppointmentDates: number[];
    rejectedAppointmentDates: number[];
    previousSelectedAppointmentsStartTimes: number[];
}

@Injectable({
    providedIn: 'root'
})
export class ItemAppointmentService {

    constructor(private appointmentService: AppointmentService,
                private storageService: StorageService) {

    }

    init(item: Item, existingApplicant: Applicant): Promise<InitScheduledDates> {
        return new Promise<InitScheduledDates>((resolve) => {
            const promises = new Array();
            promises.push(this.appointmentService.buildScheduledDates(item.appointment));
            promises.push(this.appointmentService.getAlreadyScheduledAppointmentsWithAttendance(item._id,
                item.appointment._id, item.appointment.attendance));
            promises.push(this.buildUnavailableAppointments(existingApplicant));
            promises.push(this.appointmentService.getMyApplicants(null));
            promises.push(this.storageService.retrievePrefillItemAppointmentsStartTimes());

            forkJoin(promises).subscribe(
                (data: number[][]) => {

                    // Advertiser scheduled dates and user overall already scheduled dates
                    let allAlreadyScheduledDates: number[] = data[1];
                    allAlreadyScheduledDates = allAlreadyScheduledDates.concat(data[3]);

                    let allUnavailableDates: number[] = allAlreadyScheduledDates;
                    allUnavailableDates = allUnavailableDates.concat(data[2]);

                    const previousStartTimes: number[] = data[4];

                    this.hasStillAvailableDates(data[0], allUnavailableDates).then((hasStillAvailableDates: boolean) => {
                        resolve({
                            advertiserDates: hasStillAvailableDates ? data[0] : new Array(),
                            unavailableAppointmentDates: allAlreadyScheduledDates,
                            rejectedAppointmentDates: data[2],
                            previousSelectedAppointmentsStartTimes: previousStartTimes ? previousStartTimes : new Array()
                        });
                    });
                }
            );
        });
    }

    private buildUnavailableAppointments(existingApplicant: Applicant): Promise<{}> {
        return new Promise((resolve) => {
            const result: number[] = new Array();

            // If there is already an applicant, the dates which were already used can't be used again
            if (!Comparator.isEmpty(existingApplicant) && Comparator.hasElements(existingApplicant.agenda)) {
                for (let i: number = 0; i < existingApplicant.agenda.length; i++) {
                    result.push(Converter.getDateObj(existingApplicant.agenda[i].when).getTime());
                }
            }

            resolve(result);
        });
    }

    private hasStillAvailableDates(availableDates: number[], unavailableDates: number[]): Promise<{}> {
        return new Promise((resolve) => {
            if (!Comparator.hasElements(availableDates)) {
                resolve(true);
            } else if (!Comparator.hasElements(unavailableDates)) {
                resolve(true);
            } else {
                const result: boolean = this.compareStillAvailableDates(availableDates, unavailableDates);

                resolve(result);
            }
        });
    }

    private compareStillAvailableDates(availableDates: number[], unavailableDates: number[]): boolean {
        for (let i: number = 0; i < availableDates.length; i++) {
            if (unavailableDates.indexOf(availableDates[i]) === -1) {
                return true;
            }
        }

        return false;
    }
}
