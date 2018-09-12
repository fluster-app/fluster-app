import {Component, OnChanges, SimpleChange, Input, ViewChild, ElementRef, ViewEncapsulation} from '@angular/core';

import {AbstractGoogleComponent} from '../abstract-google-map';

// Model
import {Item} from '../../../../services/model/item/item';
import {Location} from '../../../../services/model/location/location';

// Services
import {GoogleMapService} from '../../../../services/core/map/google-map-service';
import {Platform} from '@ionic/angular';
import {Comparator} from '../../../../services/core/utils/utils';

@Component({
    templateUrl: 'google-map-item.html',
    styleUrls: ['./google-map-item.scss'],
    selector: 'app-google-map-item',
    encapsulation: ViewEncapsulation.None
})
export class GoogleMapItemComponent extends AbstractGoogleComponent implements OnChanges {

    @ViewChild('gmapsitem', {read: ElementRef}) mapElement: ElementRef;

    @Input() item: Item;
    @Input() yelpBusinesses: Yelp.YelpBusiness[];
    @Input() location: Location;

    // Refresh map if yelp detail is open and then close
    // We have got only one instance of the map
    @Input() refresh: number;

    constructor(protected platform: Platform,
                protected googleMapService: GoogleMapService) {
        super(platform, googleMapService);

        this.zoom = 13;
        this.fitBounds = false;
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        this.superMapElement = this.mapElement;

        this.onChanges(changes);

        if (!Comparator.isEmpty(changes['refresh']) && changes['refresh'].currentValue != null) {
            this.refreshMap();
        }
    }

    private refreshMap() {
        // Create new child div if it was removed
        const mapDiv: HTMLElement = this.superMapElement.nativeElement.querySelector('div');
        if (!mapDiv) {
            const nodeDiv: HTMLElement = document.createElement('div');
            this.mapElement.nativeElement.appendChild(nodeDiv);
        }

        this.initMap(this.item.address.location, this.item.title);
    }

}
