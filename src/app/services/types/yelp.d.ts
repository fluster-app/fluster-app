declare module Yelp {

    export interface YelpResponse {
        businesses: Yelp.YelpBusiness[];
        total: number;
    }

    export interface AbstractYelpBusiness {
        id: string;
        name: string;
        image_url: string;
        url: string;
        price: string;
        phone: string;
        is_closed: boolean;

        rating: number;
        review_count: number;

        categories: YelpCategory[];

        coordinates: YelpCoordinates;

        location: YelpLocation;
    }

    // https://www.yelp.co.uk/developers/documentation/v3/business_search
    export interface YelpBusiness extends AbstractYelpBusiness {
        distance: number;
    }

    // https://www.yelp.co.uk/developers/documentation/v3/business
    export interface YelpBusinessDetails extends AbstractYelpBusiness {
        is_claimed: boolean;
        photos: string[];
        hours: YelpHours[];
    }

    export interface YelpCategory {
        alias: string;
        title: string;
    }

    export interface YelpLocation {
        address1: string;
        address2: string;
        address3: string;
        city: string;
        state: string;
        zip_code: string;
        country: string;
    }

    export interface YelpCoordinates {
        latitude: number;
        longitude: number;
    }

    export interface YelpHours {
        is_open_now: boolean;
        hours_type: string;
        open: YelpHoursOpen[];
    }

    export interface YelpHoursOpen {
        day: number;
        start: string;
        end: string;
        is_overnight: boolean;
    }
}
