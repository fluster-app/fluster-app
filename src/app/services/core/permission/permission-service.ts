import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {

    isCalendarAuthorized(): Promise<{}> {
        return new Promise((resolve, reject) => {
            if (window.cordova != null && window.cordova.plugins.diagnostic) {
                window.cordova.plugins.diagnostic.isCalendarAuthorized((authorized: boolean) => {
                    resolve(authorized);
                }, (error: string) => {
                    reject(error);
                });
            } else {
                reject('No window.cordova');
            }
        });
    }
}
