import {Resources} from '../../core/utils/resources';

export class Location {
    type: string;
    coordinates: number[];

    constructor() {
        // Mongoose bug, in the server side, the default type will not be automatically added,
        // have to be set before sending new element to Mongoose
        this.type = Resources.Constants.LOCATION.GEO_TYPE;

        this.coordinates = new Array<number>();
    }


    set lng(value: number) {
        this.coordinates[0] = value;
    }

    set lat(value: number) {
        this.coordinates[1] = value;
    }

}
