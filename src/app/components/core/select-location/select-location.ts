import {Component, AfterViewInit, Output, EventEmitter} from '@angular/core';
import {FormControl} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';

import {debounceTime} from 'rxjs/operators';

// Model
import {Address} from '../../../services/model/utils/address';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {LocationUtilService} from '../../../services/core/location/location-util-service';
import {GoogleApiGeocodeService} from '../../../services/core/map/google-api-geocode-service';

@Component({
    templateUrl: 'select-location.html',
    selector: 'app-select-location'
})
export class SelectLocationComponent implements AfterViewInit {

    @Output() notifyResult: EventEmitter<Address> = new EventEmitter<Address>();

    results: google.maps.GeocoderResult[];

    searchLocationTerm: string = '';

    searchControl: FormControl;

    searching: boolean = false;

    constructor(private googleApiGeocodeService: GoogleApiGeocodeService,
                private locationUtilService: LocationUtilService) {
        this.searchControl = new FormControl();
    }

    ngAfterViewInit(): void {
        this.searchControl.valueChanges
            .pipe(
                debounceTime(700)
            )
            .subscribe((search: string) => {
                this.search();
            });
    }

    onSearchInput(newSearchLocationTerm: string) {
        this.searchLocationTerm = newSearchLocationTerm;
        this.searching = true;
    }

    private search() {
        if (Comparator.isStringEmpty(this.searchLocationTerm)) {
            this.searching = false;
            return;
        }

        this.googleApiGeocodeService.search(this.searchLocationTerm, null).then((response: Google.IGeocoder) => {
            this.searching = false;
            this.results = response.results;
        }, (response: HttpErrorResponse) => {
            this.searching = false;
            this.results = new Array();
        });
    }

    selectLocation(googleLocationResults: google.maps.GeocoderResult, lat: number, lng: number) {
        const selectedLocation: Address = this.locationUtilService.extractLocation(googleLocationResults, lat, lng);

        this.notifyResult.emit(selectedLocation);
    }
}
