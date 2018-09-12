import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

import {forkJoin} from 'rxjs';

// Model
import {User, UserInterest} from '../../model/user/user';
import {Location} from '../../model/location/location';

// Resources
import {Resources} from '../utils/resources';
import {Comparator} from '../utils/utils';

// Services
import {GoogleApiPlaceService} from '../map/google-api-place-service';

@Injectable({
    providedIn: 'root'
})
export class UserInterestsService {

    constructor(private googleApiPlaceService: GoogleApiPlaceService) {

    }

    setDefaultInterests(user: User): Promise<{}> {
        return new Promise((resolve, reject) => {

            const promises = new Array();

            promises.push(this.buildDefaultInterestWork(user));
            promises.push(this.buildDefaultInterestTrainStation(user));
            promises.push(this.buildDefaultInterestAirpot(user));

            if (promises.length === 0) {
                resolve();
            } else {
                forkJoin(promises).subscribe(
                    (data: UserInterest[]) => {
                        resolve(data);
                    },
                    (err: any) => {
                        reject(err);
                    }
                );
            }
        });
    }

    buildDefaultInterestTrainStation(user: User): Promise<{}> {
        const queryMainStation: string = encodeURI(user.userParams.address.city + '+'
            + Resources.Constants.USER.INTEREST.MAIN_TRAIN_STATION);
        return this.buildDefaultInterestNearby(user.userParams.address.location,
            queryMainStation, Resources.Constants.GOOGLE.PLACE_API.TYPE.TRAIN_STATION, Resources.Constants.USER.INTEREST.TYPE.TRAIN);
    }

    buildDefaultInterestAirpot(user: User): Promise<{}> {
        const queryAirport: string = encodeURI(user.userParams.address.city + '+' + Resources.Constants.USER.INTEREST.AIRPORT);
        return this.buildDefaultInterestNearby(user.userParams.address.location,
            queryAirport, Resources.Constants.GOOGLE.PLACE_API.TYPE.AIRPORT, Resources.Constants.USER.INTEREST.TYPE.AIRPORT);
    }

    buildDefaultInterestWork(user: User): Promise<{}> {
        return new Promise((resolve, reject) => {
            const queryWork: string = this.getQueryWork(user);

            if (!Comparator.isStringEmpty(queryWork)) {
                this.buildDefaultInterestPlace(encodeURI(queryWork), user.userParams.address.location,
                    Resources.Constants.GOOGLE.PLACE_API.WIDE_RADIUS, null, Resources.Constants.USER.INTEREST.TYPE.WORK).then((interest: UserInterest) => {
                    resolve(interest);
                }, (errorResponse: HttpErrorResponse) => {
                    reject(errorResponse);
                });
            } else {
                resolve(new UserInterest());
            }
        });
    }

    private getQueryWork(user: User): string {
        if (!Comparator.isEmpty(user.description.employer)) {
            return this.formatSearchPlaceQuery(user.description.employer);
        } else {
            return null;
        }
    }

    buildDefaultInterestEducation(user: User): Promise<{}> {
        return new Promise((resolve, reject) => {
            const querySchool: string = this.getQuerySchool(user);

            if (!Comparator.isStringEmpty(querySchool)) {
                this.buildDefaultInterestPlace(encodeURI(querySchool), null, null, null,
                    Resources.Constants.USER.INTEREST.TYPE.SCHOOL).then((interest: UserInterest) => {
                    resolve(interest);
                }, (errorResponse: HttpErrorResponse) => {
                    reject(errorResponse);
                });
            } else {
                resolve(new UserInterest());
            }
        });
    }

    private getQuerySchool(user: User): string {
        if (!Comparator.isEmpty(user.description.school)) {
            return this.formatSearchPlaceQuery(user.description.school);
        } else {
            return null;
        }
    }

    private formatSearchPlaceQuery(query: string): string {
        if (!Comparator.isStringEmpty(query)) {
            // Remove some stuffs which seems to doesn't fit well with the places search
            if (query.indexOf('|') > -1) {
                query = query.substring(0, query.indexOf('|'));
            }

            if (query.indexOf('(') > -1) {
                query = query.substring(0, query.indexOf('('));
            }
        }

        return query;
    }

    private buildDefaultInterestNearby(nextTo: Location, query: string, queryTypes: string, interestType: string): Promise<{}> {
        return new Promise((resolve, reject) => {

            // First, find latitude and longitude for interest
            this.googleApiPlaceService.searchPlaceNearby(nextTo, query, queryTypes).then((results: google.maps.places.PlaceResult[]) => {
                resolve(this.buildNewInterest(results, interestType));
            }, (errorResponse: HttpErrorResponse) => {
                reject(errorResponse);
            });

        });
    }

    private buildDefaultInterestPlace(query: string, nextTo: Location, radius: number, queryTypes: string,
                                      interestType: string): Promise<{}> {
        return new Promise((resolve, reject) => {

            // First, find latitude and longitude for interest
            this.googleApiPlaceService.searchPlace(query, nextTo, radius, queryTypes)
                .then((predictions: google.maps.places.QueryAutocompletePrediction[]) => {
                if (!Comparator.isEmpty(predictions)) {
                    this.googleApiPlaceService.searchPlaceDetails(predictions[0].place_id)
                        .then((result: google.maps.places.PlaceResult) => {
                        const data: google.maps.places.PlaceResult[] = new Array();
                        data.push(result);

                        resolve(this.buildNewInterest(data, interestType));
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
                } else {
                    resolve(new UserInterest());
                }
            }, (errorResponse: HttpErrorResponse) => {
                reject(errorResponse);
            });

        });
    }

    private buildNewInterest(data: google.maps.places.PlaceResult[], interestType: string): UserInterest {
        if (!Comparator.isEmpty(data)) {

            const interest: UserInterest = new UserInterest();
            interest.addressName = data[0].name + ', ' + data[0].vicinity;

            // http://stackoverflow.com/questions/37808341/
            // google-maps-javascript-api-typeerror-response-data0-geometry-location-lat-is/37847117
            // Pay attention to cast

            const location: Location = new Location();
            location.coordinates.push((<any> data[0].geometry.location).lng);
            location.coordinates.push((<any> data[0].geometry.location).lat);
            interest.location = location;

            interest.type = interestType;

            return interest;
        } else {
            return new UserInterest();
        }
    }
}
