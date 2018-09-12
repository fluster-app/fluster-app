// Model
import {Location} from '../location/location';
import {Appointment} from '../appointment/appointment';
import {User} from '../user/user';

// Resources
import {Resources} from '../../core/utils/resources';

export class ItemAvailability {

    begin: Date;
    end: Date;

}

export class ItemPrice {

    gross: number;
    net: number;
    charges: number;

}

export class ItemAttributes {

    type: string;
    furnished: boolean;
    rooms: number;
    size: number;
    sharedRooms: number;
    sharedRoomsSize: number;
    price: ItemPrice;
    disabledFriendly: boolean;
    petsAllowed: boolean;
    availability: ItemAvailability;
    kidsWelcomed: boolean;

    constructor() {
        this.furnished = false;

        this.price = new ItemPrice();

        this.availability = new ItemAvailability();
    }

}

export class ItemUserLimitationsAge {

    min: number = Resources.Constants.ITEM.USER_RESTRICTIONS.AGE.MIN;
    max: number = Resources.Constants.ITEM.USER_RESTRICTIONS.AGE.MAX;

}

export class ItemUserLimitations {

    age: ItemUserLimitationsAge;
    gender: string = Resources.Constants.ITEM.USER_RESTRICTIONS.GENDER.IRRELEVANT;

    constructor() {
        this.age = new ItemUserLimitationsAge();
    }
}

export class ItemDetailParking {
    type: string;
    included: boolean;
    price: number;

    constructor() {
        this.type = Resources.Constants.ITEM.DETAIL.PARKING.TYPE.NONE;
    }
}

export class ItemAddress {

    street: string;
    zip: string;
    city: string;
    // Kreis
    district: string;
    // Gemeinde
    municipality: string;
    // Kanton
    state: string;
    country: string;

    remark: string;

    addressName: string;

    location: Location;

}

export class ItemDetail {
    description: string;
    floor: number;
    bathrooms: number;
    flatmate: number;

    tags: string[];

    createdAt: Date;

    otherPhotos: string[];

    parking: ItemDetailParking;

}

export class ItemStars {
    _id: string;
}

export class Item {
    _id: string;

    hashId: string;

    title: string;

    address: ItemAddress;

    attributes: ItemAttributes;

    userLimitations: ItemUserLimitations;

    itemDetail: ItemDetail;

    itemStars: ItemStars;

    end: Date;

    source: string;
    sourceId: string;

    mainPhoto: string;

    createdAt: Date;
    updatedAt: Date;

    status: string;

    // Right now we only need the ID here
    user: User;

    // Right now we only need the ID here
    appointment: Appointment;

    constructor() {
        this.address = new ItemAddress();

        this.attributes = new ItemAttributes();

        this.userLimitations = new ItemUserLimitations();

        this.itemDetail = new ItemDetail();

        this.source = Resources.Constants.ITEM.SOURCE;
    }

}
