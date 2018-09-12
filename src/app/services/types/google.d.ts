declare module Google {

    export interface IGeocoder {
        results: google.maps.GeocoderResult[];
        status: google.maps.GeocoderStatus;
    }

    export interface IPlaceNearbyResponse {
        results: google.maps.places.PlaceResult[];
        status: google.maps.places.PlacesServiceStatus;
    }

    export interface IPlaceResponse {
        predictions: google.maps.places.PlaceResult[];
        status: google.maps.places.PlacesServiceStatus;
    }

    export interface IPlaceDetailsResponse {
        result: google.maps.places.PlaceResult;
        status: google.maps.places.PlacesServiceStatus;
    }
}
