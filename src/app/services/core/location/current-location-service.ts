import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

// Model
import {Address} from '../../model/utils/address';

// Resources and utils
import {Comparator} from '../../core/utils/utils';

// Services
import {GoogleApiGeocodeService} from '../map/google-api-geocode-service';
import {LocationUtilService} from './location-util-service';

@Injectable({
    providedIn: 'root'
})
export class CurrentLocationService {

    private currentLocation: Address;

    constructor(private googleApiGeocodeService: GoogleApiGeocodeService, private locationUtilService: LocationUtilService) {

    }

    findCurrentLocation(): Promise<{}> {

        return new Promise((resolve, reject) => {

            // If possible, search currently location only once pro session
            if (!Comparator.isEmpty(this.currentLocation)) {
                resolve(this.currentLocation);
            }

            navigator.geolocation.getCurrentPosition(
                (data: any) => {
                    this.googleApiGeocodeService.search(null, data.coords.latitude + ',' + data.coords.longitude)
                        .then((response: Google.IGeocoder) => {
                        if (!Comparator.isEmpty(response) && !Comparator.isEmpty(response.results)) {
                            const location = this.locationUtilService.extractLocation(response.results[0],
                                data.coords.latitude, data.coords.longitude);

                            this.currentLocation = location;

                            resolve(location);
                        } else {
                            reject();
                        }
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
                }, (error: any) => {
                    reject(error);
                });
        });
    }

}
