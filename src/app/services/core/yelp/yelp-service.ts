import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';

import {TranslateService} from '@ngx-translate/core';

// Model
import {Location} from '../../model/location/location';

// Resources and utils
import {Resources} from '../../core/utils/resources';
import {Comparator} from '../utils/utils';

// Service
import {AccessTokenService} from '../user/access-token-service';

@Injectable({
    providedIn: 'root'
})
export class YelpService {

    constructor(private httpClient: HttpClient,
                private translateService: TranslateService,
                private accessTokenService: AccessTokenService) {

    }

    search(nextTo: Location): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                params = params.append('longitude', '' + nextTo.coordinates[0]);
                params = params.append('latitude', '' + nextTo.coordinates[1]);

                // Locale definition: https://www.yelp.co.uk/developers/documentation/v3/supported_locales
                if (!Comparator.isStringEmpty(this.translateService.getBrowserCultureLang())) {
                    params = params.append('locale', this.translateService.getBrowserCultureLang().replace('-', '_'));
                }

                this.httpClient.get(Resources.Constants.API.YELP + 'businesses/', {params: params})
                    .subscribe((results: Yelp.YelpResponse) => {
                        resolve(results.businesses);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    get(yelpBusiness: Yelp.YelpBusiness): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                if (!Comparator.isStringEmpty(this.translateService.getBrowserCultureLang())) {
                    params = params.append('locale', this.translateService.getBrowserCultureLang().replace('-', '_'));
                }

                this.httpClient.get(Resources.Constants.API.YELP + 'businesses/' + yelpBusiness.id, {params: params})
                    .subscribe((response: Yelp.YelpBusinessDetails) => {
                        resolve(response);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

}
