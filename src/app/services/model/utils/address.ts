export class AddressLocation {

    lat: number = null;
    lng: number = null;

    constructor(_lat: number = null, _lng: number = null) {
        this.lat = _lat;
        this.lng = _lng;
    }

}

export class Address {

    street: string = null;
    zip: string = null;
    city: string = null;
    district: string = null;
    country: string = null;
    location: AddressLocation = null;
    addressName: string = null;

    constructor() {
        this.location = new AddressLocation();
    }
}

export interface SearchLocationResults {
    selectedLocation: Address;
}
