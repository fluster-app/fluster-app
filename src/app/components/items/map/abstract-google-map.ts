import {ElementRef, SimpleChange} from '@angular/core';

// Model
import {Item} from '../../../services/model/item/item';
import {Location} from '../../../services/model/location/location';

// Utils
import {Comparator} from '../../../services/core/utils/utils';
import {Resources} from '../../../services/core/utils/resources';

// Services
import {GoogleMapService, GoogleStyle} from '../../../services/core/map/google-map-service';
import {Platform} from '@ionic/angular';

export abstract class AbstractGoogleComponent {

    RESOURCES: any = Resources.Constants;

    protected superMapElement: ElementRef;

    protected zoom: number = 13;
    protected fitBounds: boolean = false;

    item: Item;
    yelpBusinesses: Yelp.YelpBusiness[];

    private iconMainMarker: string;
    private iconYelpMarker: string;

    private map: google.maps.Map;
    private bounds: google.maps.LatLngBounds;
    private infoWindow: google.maps.InfoWindow;
    private markers: google.maps.Marker[] = new Array<google.maps.Marker>();

    constructor(protected platform: Platform,
                protected googleMapService: GoogleMapService) {
        const isAndroid: boolean = this.platform.is('android');

        this.iconMainMarker = isAndroid ? 'assets/map/md-big-pin-peach1.png' : 'assets/map/ios-big-pin-peach1.png';
        this.iconYelpMarker = isAndroid ? 'assets/map/md-small-pin-peach3.png' : 'assets/map/ios-small-pin-peach3.png';
    }

    protected onChanges(changes: { [propName: string]: SimpleChange }) {

        if (!Comparator.isEmpty(changes['yelpBusinesses']) && !Comparator.isEmpty(changes['yelpBusinesses'].currentValue)) {
            this.yelpBusinesses = changes['yelpBusinesses'].currentValue;
            this.addYelpMarkers();
        }

        if (!Comparator.isEmpty(changes['item']) && !Comparator.isEmpty(changes['item'].currentValue)) {
            this.item = changes['item'].currentValue;
            this.initMap(this.item.address.location, this.item.title);
        }
    }

    protected initMap(itemPosition: Location, text: string) {

        if (Comparator.isEmpty(itemPosition)) {
            return;
        }

        if (typeof google === 'object' && typeof google.maps === 'object') {
            const mapDiv: HTMLElement = this.superMapElement.nativeElement.querySelector('div');

            const position: google.maps.LatLng = new google.maps.LatLng(itemPosition.coordinates[1], itemPosition.coordinates[0]);

            if (this.googleMapService.isGmapInitialized()) {
                this.reuseMap(mapDiv, position, text);
            } else {
                this.createNewMap(mapDiv, position, text);
            }
        }
    }

    private reuseMap(mapDiv: HTMLElement, position: google.maps.LatLng, text: string) {
        this.map = this.googleMapService.gmap;

        this.superMapElement.nativeElement.replaceChild(this.map.getDiv(), mapDiv);

        this.map.setCenter(position);

        this.map.setZoom(this.zoom);

        if (this.googleMapService.hasMarkers()) {
            this.googleMapService.markers.forEach((marker: google.maps.Marker) => {
                marker.setMap(null);
            });

            this.googleMapService.markers = new Array();
        }

        this.markers = new Array();

        this.addMarkers(position, text);
    }

    private createNewMap(mapDiv: HTMLElement, position: google.maps.LatLng, text: string) {
        this.googleMapService.findStyle().then((style: GoogleStyle) => {
            if (google.maps) {
                const mapOptions: google.maps.MapOptions = {
                    center: position,
                    zoom: this.zoom,
                    scrollwheel: false,
                    draggable: false,
                    disableDoubleClickZoom: true,
                    streetViewControl: false,
                    clickableIcons: true,
                    fullscreenControl: false
                };

                if (!Comparator.isEmpty(style) && !Comparator.isEmpty(style.style)) {
                    mapOptions.mapTypeControlOptions = {mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']};
                    mapOptions.mapTypeControl = false;
                } else {
                    mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
                }

                this.map = new google.maps.Map(mapDiv, mapOptions);

                if (!Comparator.isEmpty(style) && !Comparator.isEmpty(style.style)) {
                    const styledMap: google.maps.StyledMapType = new google.maps.StyledMapType(style.style,
                        {name: this.RESOURCES.GOOGLE.MAP.OWN_STYLE_NAME});

                    this.map.mapTypes.set('map_style', styledMap);
                    this.map.setMapTypeId('map_style');
                }

                this.waitAndDddMarkers(position, text);

                this.googleMapService.gmap = this.map;
            }
        });
    }

    private addMarkers(position: google.maps.LatLng, text: string) {
        // Allow map to be displayed around all markers not with the item centered
        this.bounds = new google.maps.LatLngBounds();

        // The map is already loaded
        this.setMarker(position, text, this.iconMainMarker);

        this.addYelpMarkers();
    }

    private waitAndDddMarkers(position: google.maps.LatLng, text: string) {
        // Allow map to be displayed around all markers not with the item centered
        this.bounds = new google.maps.LatLngBounds();

        // Wait until the map is loaded
        google.maps.event.addListenerOnce(this.map, 'idle', () => {
            this.setMarker(position, text, this.iconMainMarker);

            this.addYelpMarkers();
        });
    }

    // place a marker
    private setMarker(position: google.maps.LatLng, content: string, icon: string) {

        const markerOptions = {
            position: position,
            map: this.map,
            icon: icon
        };

        const marker = new google.maps.Marker(markerOptions);
        this.markers.push(marker); // add marker to array
        this.googleMapService.markers = this.markers;

        this.bounds.extend(position);

        if (!Comparator.isStringEmpty(content)) {
            google.maps.event.addListener(marker, 'click', () => {
                // close window if not undefined
                if (this.infoWindow !== void 0) {
                    this.infoWindow.close();
                }

                // create new window
                const infoWindowOptions = {
                    content: content
                };

                this.infoWindow = new google.maps.InfoWindow(infoWindowOptions);
                this.infoWindow.open(this.map, marker);
            });
        }
    }

    private addYelpMarkers() {

        // Load markers only once, just in case
        if (!Comparator.isEmpty(this.markers) && this.markers.length > 1) {
            return;
        }

        if (this.map !== null && this.map !== void 0 && !Comparator.isEmpty(this.yelpBusinesses)) {
            for (let i = 0; i < this.yelpBusinesses.length; i++) {
                const yelpBusiness: Yelp.YelpBusiness = this.yelpBusinesses[i];

                const position: google.maps.LatLng = new google.maps.LatLng(yelpBusiness.coordinates.latitude,
                    yelpBusiness.coordinates.longitude);

                this.setMarker(position, yelpBusiness.name, this.iconYelpMarker);
            }

            // Recenter map according all markers
            if (this.fitBounds) {
                this.map.fitBounds(this.bounds);
            }
        }
    }

}
