import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';

import {forkJoin} from 'rxjs';

import * as moment from 'moment';

// Model
import {Item} from '../../model/item/item';
import {Applicant} from '../../model/appointment/applicant';
import {Appointment, AppointmentAgendaSchedule} from '../../model/appointment/appointment';
import {PickAppointmentExistingDates} from '../../model/utils/pickAppointments';

// Resources and utils
import {Resources} from '../../core/utils/resources';
import {Comparator, Converter} from '../../core/utils/utils';
import {AccessTokenBody, AccessTokenService} from '../user/access-token-service';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService) {
    }

    findApplicants(itemId: string, appointmentId: string, status: string, populateUser: boolean,
                   pageIndex: number, upcoming: boolean, sort: string, candidateId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                params = params.append('itemId', itemId);
                params = params.append('appointmentId', appointmentId);

                if (status != null) {
                    params = params.append('status', status);
                }

                if (upcoming) {
                    params = params.append('upcoming', 'true');
                }

                if (candidateId != null) {
                    params = params.append('candidateId', candidateId);
                }

                params = params.append('populateUser', populateUser ? 'true' : 'false');
                params = params.append('pageIndex', '' + pageIndex);

                params = params.append('sort', sort);

                this.httpClient.get(Resources.Constants.API.APPLICANTS, {params: params})
                    .subscribe((applicants: Applicant[]) => {
                        resolve(applicants);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    getAlreadyScheduledAppointmentsWithAttendance(itemId: string, appointmentId: string, attendance: string): Promise<{}> {
        if (Comparator.equals(Resources.Constants.APPOINTMENT.ATTENDANCE.MULTIPLE, attendance)) {
            // In case of multiple attendance for a scheduled viewing, it's always possible to apply for
            const alreadyScheduled: number[] = new Array<number>();

            return new Promise((resolve) => {
                resolve(alreadyScheduled);
            });
        } else {
            return this.getAlreadyScheduledAppointments(itemId, appointmentId);
        }
    }

    getAlreadyScheduledAppointments(itemId: string, appointmentId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                params = params.append('itemId', itemId);
                params = params.append('appointmentId', appointmentId);
                params = params.append('status', Resources.Constants.APPLICANT.STATUS.ACCEPTED);
                params = params.append('populateUser', 'false');

                this.httpClient.get(Resources.Constants.API.APPLICANTS, {params: params})
                    .subscribe((data: Applicant[]) => {
                        const alreadyScheduled = this.convertToAlreadyScheduledArray(data);

                        resolve(alreadyScheduled);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });

    }

    updateApplicant(applicant: Applicant): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['applicant'] = applicant;

                this.httpClient.put(Resources.Constants.API.APPLICANTS + applicant._id, body, {headers: headers})
                    .subscribe((data: Applicant) => {
                        resolve(data);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    createApplicant(applicant: Applicant): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['applicant'] = applicant;

                this.httpClient.post(Resources.Constants.API.APPLICANTS, body, {headers: headers})
                    .subscribe((applicantCreated: Applicant) => {
                        resolve(applicantCreated);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    getDeeplinkApplicant(itemId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                params = params.append('itemId', itemId);

                this.httpClient.get(Resources.Constants.API.DEEPLINK_APPLICANT, {params: params})
                    .subscribe((response: Communication.LikeStatus) => {
                        resolve(response);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    buildScheduledDates(appointment: Appointment): Promise<{}> {

        return new Promise((resolve) => {

            const future: Date = moment(new Date()).add(Resources.Constants.APPOINTMENT.DISPLAY.DELAY_BEFORE_FIRST_VIEWING, 'h').toDate();

            if (!Comparator.equals(Resources.Constants.APPOINTMENT.AGENDA.TYPE.TIME_FRAME, appointment.agenda.type)) {
                const schedule: number[] = new Array();

                for (let i: number = 0; i < appointment.agenda.schedule.length; i++) {
                    const tmp: Date = Converter.getDateObj(appointment.agenda.schedule[i].when);

                    // Push only dates in the future
                    if (tmp.getTime() > future.getTime()) {
                        schedule.push(tmp.getTime());
                    }
                }

                resolve(schedule);
            } else {
                const schedule: number[] = new Array();

                for (let i: number = 0; i < appointment.agenda.schedule.length; i++) {
                    const agendaSchedule: AppointmentAgendaSchedule = appointment.agenda.schedule[i];

                    for (let j: number = 0; j < agendaSchedule.timeFrame.length; j++) {
                        const timeFrame: string = agendaSchedule.timeFrame[j];

                        let count: number = 0;
                        let startTime: number = 0;

                        if (Comparator.equals(timeFrame, Resources.Constants.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.MORNING.MORNING)) {
                            count = Resources.Constants.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.MORNING.COUNT;
                            startTime = Resources.Constants.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.MORNING.FIRST_START_TIME_HOURS;
                        } else if (Comparator.equals(timeFrame,
                            Resources.Constants.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.AFTERNOON.AFTERNOON)) {
                            count = Resources.Constants.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.AFTERNOON.COUNT;
                            startTime = Resources.Constants.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.AFTERNOON.FIRST_START_TIME_HOURS;
                        } else if (Comparator.equals(timeFrame,
                            Resources.Constants.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.EVENING.EVENING)) {
                            count = Resources.Constants.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.EVENING.COUNT;
                            startTime = Resources.Constants.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.EVENING.FIRST_START_TIME_HOURS;
                        }

                        for (let k: number = 0; k < count; k++) {
                            const scheduleDate: Date = Converter.getDateObj(agendaSchedule.when);
                            scheduleDate.setHours(startTime,
                                Resources.Constants.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.START_TIME_MIN, 0, 0);

                            // Push only dates in the future
                            if (scheduleDate.getTime() > future.getTime()) {
                                schedule.push(scheduleDate.getTime());
                            }

                            startTime += Resources.Constants.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.APPOINTMENT_LENGTH;
                        }
                    }
                }

                resolve(schedule);
            }

        });
    }

    updateApplicantStatus(itemId: string, applicantId: string, notApplicantId: string,
                          currentStatus: string[], newStatus: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['itemId'] = itemId;
                body['currentStatus'] = currentStatus.join();
                body['newStatus'] = newStatus;

                if (!Comparator.isStringEmpty(applicantId)) {
                    body['applicantId'] = applicantId;
                }

                if (!Comparator.isStringEmpty(notApplicantId)) {
                    body['notApplicantId'] = notApplicantId;
                }

                this.httpClient.post(Resources.Constants.API.STATUS_APPLICANTS, body, {headers: headers})
                    .subscribe((result: Communication.MongoUpdate) => {
                        resolve(result);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    updateAppointmentSchedule(appointment: Appointment, schedule: number[]): Promise<{}> {

        return new Promise((resolve, reject) => {
            this.extractSchedule(appointment, schedule).then(async (updatedAppointment: Appointment) => {
                try {

                    const headers: HttpHeaders = new HttpHeaders();
                    headers.append('Content-Type', 'application/json');

                    const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                    body['appointment'] = updatedAppointment;

                    this.httpClient.put(Resources.Constants.API.APPOINTMENTS + appointment._id, body, {headers: headers})
                        .subscribe((updatedAppointmentPut: Appointment) => {
                            resolve(updatedAppointmentPut);
                        }, (errorResponse: HttpErrorResponse) => {
                            reject(errorResponse);
                        });
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    extractSchedule(appointment: Appointment, appointmentSchedule: number[]): Promise<{}> {

        return new Promise((resolve) => {
            if (appointmentSchedule == null) {
                resolve(appointment);
            } else {
                appointment.agenda.type = Resources.Constants.APPOINTMENT.AGENDA.TYPE.EXACT;
                appointment.agenda.schedule = new Array<AppointmentAgendaSchedule>();

                for (let i = 0; i < appointmentSchedule.length; i++) {
                    const schedule: number = appointmentSchedule[i];

                    const agendaSchedule: AppointmentAgendaSchedule = new AppointmentAgendaSchedule();

                    agendaSchedule.when = new Date(schedule);
                    agendaSchedule.timeFrame = null;

                    appointment.agenda.schedule.push(agendaSchedule);
                }

                resolve(appointment);
            }
        });
    }

    getMyApplicants(candidateId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                if (!Comparator.isStringEmpty(candidateId)) {
                    params = params.append('candidateId', candidateId);
                }

                this.httpClient.get(Resources.Constants.API.MY_APPLICANTS, {params: params})
                    .subscribe((data: Applicant[]) => {
                        const alreadyScheduled = this.convertToAlreadyScheduledArray(data);

                        resolve(alreadyScheduled);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });

    }

    private convertToAlreadyScheduledArray(data: Applicant[]) {
        const alreadyScheduled: number[] = new Array<number>();

        if (!Comparator.isEmpty(data)) {
            for (let i: number = 0; i < data.length; i++) {
                const alreadyAcceptedApplicant: Applicant = data[i];
                alreadyScheduled.push(Converter.getDateObj(alreadyAcceptedApplicant.selected).getTime());
            }
        }

        return alreadyScheduled;
    }

    buildExistingDates(item: Item, appointment: Appointment): Promise<PickAppointmentExistingDates> {
        return new Promise((resolve) => {
            if (Comparator.isEmpty(appointment) || Comparator.isEmpty(appointment.agenda) || appointment.agenda.schedule == null) {
                resolve({scheduledDates: null, unavailableAppointmentDates: null});
            } else if (Comparator.isEmpty(item) || Comparator.isStringEmpty(item._id)) {
                // In wizard in case of new item
                resolve({scheduledDates: null, unavailableAppointmentDates: null});
            } else {
                const promises = new Array();
                promises.push(this.buildScheduledDates(appointment));
                promises.push(this.getAlreadyScheduledAppointments(item._id, item.appointment._id));

                forkJoin(promises).subscribe(
                    (data: number[][]) => {
                        if (Comparator.isEmpty(data)) {
                            resolve(null);
                        } else if (data.length > 1) {
                            resolve({scheduledDates: data[0], unavailableAppointmentDates: data[1]});
                        } else {
                            resolve({scheduledDates: data[0], unavailableAppointmentDates: null});
                        }
                    });
            }
        });
    }
}
