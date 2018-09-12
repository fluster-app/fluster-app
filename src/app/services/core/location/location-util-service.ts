import {Injectable} from '@angular/core';

// External libs and scripts
import * as moment from 'moment';

// Model
import {Location} from '../../model/location/location';
import {Item, ItemAddress} from '../../model/item/item';
import {UserInterest} from '../../model/user/user';
import {Address, AddressLocation} from '../../model/utils/address';

// Resources and utils
import {Resources} from '../../core/utils/resources';
import {Comparator} from '../../core/utils/utils';

@Injectable({
    providedIn: 'root'
})
export class LocationUtilService {

    constructor() {

    }

    // Extract information from the Google API answer for a location
    extractLocation(googleLocationResults: google.maps.GeocoderResult, lat: number, lng: number): Address {

        const location: Address = new Address();

        location.location = new AddressLocation(lat, lng);

        location.addressName = googleLocationResults.formatted_address;

        let streetNumber: string;
        let street: string;

        let city: string;
        let postalTown: string;

        // Find/build city name
        for (let i = 0; i < googleLocationResults.address_components.length; i++) {
            for (let b = 0; b < googleLocationResults.address_components[i].types.length; b++) {

                //there are different types that might hold a city admin_area_lvl_1
                // usually does in come cases looking for sublocality type will be more appropriate
                if (googleLocationResults.address_components[i].types[b] === 'locality') {
                    city = googleLocationResults.address_components[i].long_name;
                } else if (googleLocationResults.address_components[i].types[b] === 'postal_town') {
                    postalTown = googleLocationResults.address_components[i].long_name;
                } else if (googleLocationResults.address_components[i].types[b] === 'street_number') {
                    streetNumber = googleLocationResults.address_components[i].long_name;
                } else if (googleLocationResults.address_components[i].types[b] === 'route') {
                    street = googleLocationResults.address_components[i].long_name;
                } else if (googleLocationResults.address_components[i].types[b] === 'sublocality_level_1') {
                    location.district = googleLocationResults.address_components[i].long_name;
                } else if (googleLocationResults.address_components[i].types[b] === 'country') {
                    location.country = googleLocationResults.address_components[i].short_name;
                } else if (googleLocationResults.address_components[i].types[b] === 'postal_code') {
                    location.zip = googleLocationResults.address_components[i].long_name;
                }
            }
        }

        location.street = !Comparator.isStringEmpty(street) ? (!Comparator.isStringEmpty(streetNumber) ?
            street + ' ' + streetNumber : street) : '';

        if (!Comparator.isStringEmpty(city) || !Comparator.isStringEmpty(postalTown)) {
            location.city = Comparator.isStringEmpty(city) ? postalTown : city;
        }

        return location;
    }

    calculateShortestRoute(item: Item, interest: UserInterest): Promise<{}> {
        const directionsRequest: google.maps.DirectionsRequest = this.getDirectionRequest(item.address.location, interest);

        const directionsService = new google.maps.DirectionsService();

        return new Promise((resolve) => {
            directionsService.route(directionsRequest, (response: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
                if (status === google.maps.DirectionsStatus.OK) {

                    const tmp = this.computeShortestDirectionTime(response);

                    resolve(tmp);
                } else {
                    // Rejecting isn't compatible with forkJoin
                    resolve(null);
                }
            });
        });
    }

    extractAddressname(address: ItemAddress): string {
        let concatAddressName = '';

        if (Comparator.isEmpty(address)) {
            return concatAddressName;
        }

        if (!Comparator.isEmpty(address.street)) {
            concatAddressName += address.street + ', ';
        }

        if (!Comparator.isEmpty(address.zip)) {
            concatAddressName += address.zip + ', ';
        }

        if (!Comparator.isEmpty(address.city)) {
            concatAddressName += address.city + ', ';
        }

        if (!Comparator.isEmpty(address.state)) {
            concatAddressName += address.state + ', ';
        }

        if (!Comparator.isEmpty(address.country)) {
            concatAddressName += address.country;
        }

        return concatAddressName;
    }

    private computeShortestDirectionTime(googleDirections: google.maps.DirectionsResult): number {
        let duration = 0;

        googleDirections.routes.forEach((route: google.maps.DirectionsRoute, key: number) => {
            route.legs.forEach((leg: google.maps.DirectionsLeg, keyRoute: number) => {
                if (leg.duration.value > duration) {
                    duration = leg.duration.value;
                }
            });
        });

        return Math.floor(duration / 60);
    }

    // Get the direction with train, bus etc. next monday at 8am
    private getDirectionRequest(origin: Location, interest: UserInterest): google.maps.DirectionsRequest {
        // next monday, or this monday + 7 days = 1 + 7 = 8
        const nextMondayAt8am: Date = moment().day(8).hours(8).minutes(0).toDate();

        const transitModes: google.maps.TransitMode[] = new Array<google.maps.TransitMode>();

        const transitOptions: google.maps.TransitOptions = {
            departureTime: nextMondayAt8am,
            modes: transitModes,
            routingPreference: google.maps.TransitRoutePreference.LESS_WALKING
        };

        const directionsRequest: google.maps.DirectionsRequest = {
            origin: new google.maps.LatLng(origin.coordinates[1], origin.coordinates[0]),
            destination: interest.addressName,
            travelMode: this.getGoogleTravelMode(interest),
            transitOptions: transitOptions,
            unitSystem: google.maps.UnitSystem.METRIC,
            optimizeWaypoints: false,
            provideRouteAlternatives: false
        };

        return directionsRequest;
    }

    private getGoogleTravelMode(interest: UserInterest): google.maps.TravelMode {
        if (Comparator.equals(interest.travelMode, Resources.Constants.USER.INTEREST.TRAVEL_MODE.BICYCLING)) {
            return google.maps.TravelMode.BICYCLING;
        } else if (Comparator.equals(interest.travelMode, Resources.Constants.USER.INTEREST.TRAVEL_MODE.DRIVING)) {
            return google.maps.TravelMode.DRIVING;
        } else if (Comparator.equals(interest.travelMode, Resources.Constants.USER.INTEREST.TRAVEL_MODE.WALKING)) {
            return google.maps.TravelMode.WALKING;
        } else {
            return google.maps.TravelMode.TRANSIT;
        }
    }


}
