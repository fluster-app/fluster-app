import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';

// Model
import {Location} from '../../model/location/location';

// Resources
import {Resources} from '../../core/utils/resources';
import {AccessTokenBody, AccessTokenService} from '../user/access-token-service';

@Injectable({
    providedIn: 'root'
})
export class GoogleApiPlaceService {

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService) {

    }

    searchPlaceNearby(nextTo: Location, query: string, types: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['nextTo'] = nextTo.coordinates[1] + ',' + nextTo.coordinates[0];
                body['radius'] = Resources.Constants.GOOGLE.PLACE_API.RADIUS;
                body['keyword'] = query;
                body['type'] = types;

                this.httpClient.post(Resources.Constants.API.GOOGLE_SEARCH_PLACE_NEARBY, body, {headers: headers})
                    .subscribe((response: Google.IPlaceNearbyResponse) => {
                        if (response.status === google.maps.places.PlacesServiceStatus.OK) {
                            resolve(response.results);
                        } else {
                            resolve(null);
                        }
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });

    }

    searchPlace(input: string, nextTo: Location, radius: number, types: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['input'] = input;
                body['type'] = types;

                if (nextTo != null) {
                    body['nextTo'] = nextTo.coordinates[1] + ',' + nextTo.coordinates[0];
                }

                if (radius != null) {
                    body['radius'] = radius;
                }

                this.httpClient.post(Resources.Constants.API.GOOGLE_SEARCH_PLACE, body, {headers: headers})
                    .subscribe((response: Google.IPlaceResponse) => {
                        if (response.status === google.maps.places.PlacesServiceStatus.OK) {
                            resolve(response.predictions);
                        } else {
                            resolve(null);
                        }
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });

    }

    searchPlaceDetails(placeId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['placeId'] = placeId;

                this.httpClient.post(Resources.Constants.API.GOOGLE_SEARCH_PLACE_DETAILS, body, {headers: headers})
                    .subscribe((response: Google.IPlaceDetailsResponse) => {
                        if (response.status === google.maps.places.PlacesServiceStatus.OK) {
                            resolve(response.result);
                        } else {
                            resolve(null);
                        }
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });

    }
}
