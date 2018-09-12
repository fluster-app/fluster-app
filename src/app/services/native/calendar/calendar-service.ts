import {Injectable} from '@angular/core';

import {environment} from '../../../../environments/environment';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

// Model
import {Item} from '../../model/item/item';

// Resources
import {Resources} from '../../core/utils/resources';
import {Converter, Comparator} from '../../core/utils/utils';

// Services
import {LocationUtilService} from '../../core/location/location-util-service';
import {PermissionService} from '../../core/permission/permission-service';

@Injectable({
    providedIn: 'root'
})
export class CalendarService {

    constructor(private translateService: TranslateService,
                private locationUtilService: LocationUtilService,
                private permissionService: PermissionService) {

    }

    removeAppoinmentFromCalendar(item: Item, selectedDate: Date, notes: string): Promise<{}> {
        if (environment.cordova) {
            return this.handleCordovaAppoinmentCalendar(item, selectedDate, notes, false, true);
        } else {
            return this.pwaDoNothing();
        }
    }

    handleAppoinmentCalendar(item: Item, selectedDate: Date, notes: string, exportMode: boolean, exportOnly: boolean): Promise<{}> {
        if (environment.cordova) {
            return this.handleCordovaAppoinmentCalendar(item, selectedDate, notes, exportMode, exportOnly);
        } else {
            return this.pwaDoNothing();
        }
    }

    private handleCordovaAppoinmentCalendar(item: Item, selectedDate: Date, notes: string, exportMode: boolean,
                                            exportOnly: boolean): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.permissionService.isCalendarAuthorized().then((authorized: boolean) => {
                if (authorized) {
                    this.handleCalendar(item, selectedDate, notes, exportMode, exportOnly).then(() => {
                        resolve();
                    }, (err: string) => {
                        reject(err);
                    });
                } else {
                    // TODO: Right now, permission service send false in two cases
                    // - when the permission is set to false on device
                    // - when the permission isn't yet defined on the device (= null)
                    // https://github.com/dpa99c/cordova-diagnostic-plugin/issues/134
                    this.handleCalendar(item, selectedDate, notes, exportMode, exportOnly).then(() => {
                        resolve();
                    }, (err: string) => {
                        reject(err);
                    });
                }
            }, (errorMessage: string) => {
                reject(errorMessage);
            });
        });
    }

    // exportMode: true = export, false = remove
    // exportOnly: true = export, false = try to update first, if nothing found, export
    private handleCalendar(item: Item, selectedDate: Date, notes: string, exportMode: boolean, exportOnly: boolean): Promise<{}> {
        const startDate: Date = Converter.getDateObj(selectedDate);

        const endDate: Date = moment(startDate).add(
            Resources.Constants.APPOINTMENT.AGENDA.SCHEDULE.TIME_FRAME.APPOINTMENT_LENGTH, 'h').toDate();

        let itemAddressName = this.locationUtilService.extractAddressname(item.address);

        if (!Comparator.isStringEmpty(itemAddressName)) {
            itemAddressName = itemAddressName.trim();
        }

        if (exportMode) {
            if (exportOnly) {
                return this.exportToCalendar(notes, startDate, endDate, itemAddressName);
            } else {
                return this.singleExportToCalendar(notes, startDate, endDate, itemAddressName);
            }
        } else {
            return this.removeFromCalendar(notes, startDate, endDate, itemAddressName);
        }
    }

    private exportToCalendar(notes: string, startDate: Date, endDate: Date, itemAddressName: string): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.translateService.get('CALENDAR.DEVICE.TITLE').subscribe((title: string) => {
                window.plugins.calendar.createEvent(
                    title,
                    itemAddressName,
                    notes,
                    startDate,
                    endDate,
                    (result: string) => {
                        resolve();
                    }, (err: string) => {
                        reject(err);
                    });
            });
        });
    }

    private removeFromCalendar(notes: string, startDate: Date, endDate: Date, itemAddressName: string): Promise<{}> {

        return new Promise((resolve, reject) => {
            this.translateService.get('CALENDAR.DEVICE.TITLE').subscribe((title: string) => {
                window.plugins.calendar.deleteEvent(
                    title,
                    itemAddressName,
                    notes,
                    startDate,
                    endDate,
                    (result: string) => {
                        resolve();
                    }, (err: string) => {
                        reject(err);
                    });
            });
        });
    }

    private singleExportToCalendar(notes: string, startDate: Date, endDate: Date, itemAddressName: string): Promise<{}> {
        return new Promise((resolve, reject) => {

            this.translateService.get('CALENDAR.DEVICE.TITLE').subscribe((title: string) => {
                window.plugins.calendar.findEvent(
                    title,
                    itemAddressName,
                    notes,
                    startDate,
                    endDate, (results: any) => {
                        if (!Comparator.hasElements(results)) {
                            window.plugins.calendar.createEvent(
                                title,
                                itemAddressName,
                                notes,
                                startDate,
                                endDate,
                                (result: string) => {
                                    resolve();
                                }, (err: string) => {
                                    reject(err);
                                });
                        } else {
                            resolve();
                        }
                    }, (err: string) => {
                        reject(err);
                    });
            });
        });
    }

    private pwaDoNothing(): Promise<{}> {
        return new Promise((resolve) => {
            resolve();
        });
    }
}
