import {Comparator} from '../../core/utils/utils';
import {Location} from '../location/location';
import {Resources} from '../../core/utils/resources';
import {Product} from '../product/product';

export class UserSpotifyArtistExternalUrl {
    spotify: string;
}

export class UserSpotifyArtistImg {
    height: number;
    width: number;
    url: string;
}

export class UserSpotifyArtist {
    _id: string;
    id: string;
    name: string;
    external_urls: UserSpotifyArtistExternalUrl;
    images: UserSpotifyArtistImg[];
    uri: string;
    display: boolean;
}

export class UserSpotify {

    _id: string;
    artists: UserSpotifyArtist[];

    createdAt: Date;
    updatedAt: Date;
}

export class UserItemAvailability {

    begin: Date;
    end: Date;

}

export class UserInterest {

    addressName: string;

    location: Location;

    type: string;
    travelMode: string;
    maxTravelTime: number;

    status: boolean;

    createdAt: Date;
    updatedAt: Date;

    constructor() {
        this.travelMode = Resources.Constants.USER.INTEREST.TRAVEL_MODE.TRANSIT;

        this.status = true;
    }

}

export class UserInterests {
    _id: string;

    interests: UserInterest[];

    createdAt: Date;

    constructor() {
        this.interests = new Array<UserInterest>();
    }

}

// Which type of item
export class UserItem {

    furnished: boolean;
    type: string;
    room: UserItemRoom;
    budget: UserItemBudget;
    tags: string[];
    groundFloor: boolean;
    disabledFriendly: boolean;
    petsAllowed: boolean;
    parking: boolean;
    minSize: number;
    availability: UserItemAvailability;

}

export class UserItemBudget {

    min: number;
    max: number;

}

export class UserItemRoom {

    room1: boolean;
    room2: boolean;
    room3: boolean;
    room4: boolean;
    room5: boolean;

    static toStringCommaSeparatedParameters(room: UserItemRoom): string {
        let param: string = '';

        if (Comparator.isEmpty(room)) {
            return param;
        }

        if (room.room5) {
            param += 'room5';
        }

        if (room.room4) {
            param += (!Comparator.isStringEmpty(param) ? ',' : '') + 'room4';
        }

        if (room.room3) {
            param += (!Comparator.isStringEmpty(param) ? ',' : '') + 'room3';
        }

        if (room.room2) {
            param += (!Comparator.isStringEmpty(param) ? ',' : '') + 'room2';
        }

        if (room.room1) {
            param += (!Comparator.isStringEmpty(param) ? ',' : '') + 'room1';
        }

        return param;
    }

}

export class UserAppSettings {

    browsing: boolean = true;
    calendarExport: boolean;
    pushNotifications: boolean = true;
    allowSuperstars: boolean = true;

}

export class UserDescriptionEmail {

    email: string;
    display: boolean;


}

export class UserDescriptionPhone {

    number: string;
    display: boolean;

}

export class UserDescriptionSpotify {
    // Not populated
    spotify: string;
    display: boolean;

    constructor() {
        this.display = true;
    }
}

export class UserDescriptionHobbies {
    sports: string[];
    arts: string[];
    food: string[];
    places: string[];
}

export class UserDescriptionLifestyle {
    cleanliness: string;
    guests: string;
    party: string;
    food: string;
}

export class UserDescription {

    bio: string;
    school: string;
    employer: string;
    phone: UserDescriptionPhone;
    email: UserDescriptionEmail;
    languages: string[];
    displayName: boolean = true;
    spotify: UserDescriptionSpotify;
    lifestyle: UserDescriptionLifestyle;
    hobbies: UserDescriptionHobbies;
}

export class UserAddress {

    addressName: string;
    city: string;
    country: string;

    distance: number;

    location: Location;

}

export class UserFacebookElement {

    id: string;
    name: string;

}

export class UserFacebookLikeElement {

    id: string;
    name: string;
    created_time: Date;

}

export class UserParams {

    address: UserAddress;

    interests: UserInterests;

    item: UserItem;

    appSettings: UserAppSettings;

    createdAt: Date;

    updatedAt: Date;

    constructor() {
        this.address = new UserAddress();

        this.interests = new UserInterests();

        this.item = new UserItem();

        this.appSettings = new UserAppSettings();
    }

}

export class UserFacebookLikes {

    data: UserFacebookLikeElement[];

}

export class UserFacebook {

    id: string;

    firstName: string;
    lastName: string;
    birthday: Date;
    pictureUrl: string;
    gender: string;

    location: UserFacebookElement;

    likes: UserFacebookLikes;

}

export class UserGoogle {
    id: string;
}

export class User {
    _id: string;

    facebook: UserFacebook;

    google: UserGoogle;

    description: UserDescription;

    userParams: UserParams;

    updatedAt: Date;

    status: string;
}

export class AccessToken {
    apiAccessToken: string;
    expirationDate: Date;
    userId: string;
    googleAuth: boolean;
}

export class Subscription {
    user: User;
    product: Product;
    end: Date;
    browse: boolean;
    status: string;
}

export class FreemiumRulesBrowse {
    reviewDisliked: boolean;
    changeDistance: boolean;
    changeBudget: boolean;
    viewApplicants: boolean;
    maxInterests: number;
    maxDailyLikes: number;
}

export class FreemiumRulesAd {
    maxDailySuperstars: number;
}

export class FreemiumRules {
    browse: FreemiumRulesBrowse;
    ad: FreemiumRulesAd;
}

export class UserAccess {
    accessToken: AccessToken;
    user: User;
    subscription: Subscription;
    freemiumRules: FreemiumRules;
}
