import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

// Resources
import {Resources} from '../../core/utils/resources';
import {Comparator} from '../../core/utils/utils';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class GoogleApiGeocodeService {

    constructor(private httpClient: HttpClient) {

    }

    search(searchLocationTerm: string, latlng: string): Promise<{}> {

        let params: HttpParams = new HttpParams();

        params = params.set('key', Resources.Constants.GOOGLE.API.KEY);

        if (!Comparator.isStringEmpty(searchLocationTerm)) {
            params = params.append('address', searchLocationTerm);
        }

        if (!Comparator.isStringEmpty(latlng)) {
            params = params.append('latlng', latlng);
        }

        return new Promise((resolve, reject) => {
            this.httpClient.get(Resources.Constants.GOOGLE.API.URL, {params: params})
                .subscribe((response: Google.IGeocoder) => {
                    resolve(response);
                }, (errorResponse: HttpErrorResponse) => {
                    reject(errorResponse);
                });
        });

    }

}
