import {Component, OnChanges, SimpleChange, Input, ElementRef, ViewChild, ViewEncapsulation} from '@angular/core';

import {AbstractGoogleComponent} from '../abstract-google-map';

// Model
import {Item} from '../../../../services/model/item/item';
import {Location} from '../../../../services/model/location/location';

// Services
import {GoogleMapService} from '../../../../services/core/map/google-map-service';
import {Platform} from '@ionic/angular';

@Component({
    templateUrl: 'google-map-yelp.html',
    styleUrls: ['./google-map-yelp.scss'],
    selector: 'app-google-map-yelp',
    encapsulation: ViewEncapsulation.None
})
export class GoogleMapYelpComponent extends AbstractGoogleComponent implements OnChanges {

    @ViewChild('gmapsyelp', {read: ElementRef}) mapElement: ElementRef;

    @Input() item: Item;
    @Input() yelpBusinesses: Yelp.YelpBusiness[];
    @Input() location: Location;

    constructor(protected platform: Platform,
                protected googleMapService: GoogleMapService) {
        super(platform, googleMapService);

        this.zoom = 15;
        this.fitBounds = true;
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        this.superMapElement = this.mapElement;

        this.onChanges(changes);
    }

}
