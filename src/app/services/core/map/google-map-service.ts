import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

// Utils
import {Comparator} from '../utils/utils';

export interface GoogleStyle {
    style: google.maps.MapTypeStyle[];
}

@Injectable({
    providedIn: 'root'
})
export class GoogleMapService {

    private style: GoogleStyle = null;

    private loaded: boolean;

    // We only load once the map for the all app, Safari's bug
    gmap: google.maps.Map;
    markers: google.maps.Marker[];

    constructor(private httpClient: HttpClient) {
        this.loaded = false;
    }

    findStyle(): Promise<{}> {
        return new Promise((resolve) => {

            if (this.loaded) {
                resolve(this.style);
            } else {
                this.httpClient.get('./assets/map/fluster-map-style.json')
                    .subscribe((res: GoogleStyle) => {
                        this.style = res;
                        this.loaded = true;

                        resolve(this.style);
                    }, (error: HttpErrorResponse) => {
                        this.loaded = true;
                        resolve(this.style);
                    });
            }

        });
    }

    isGmapInitialized(): boolean {
        return !Comparator.isEmpty(this.gmap);
    }

    hasMarkers(): boolean {
        return !Comparator.isEmpty(this.markers);
    }

}
