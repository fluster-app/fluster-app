import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';

// Model
import {Item} from '../model/item/item';

// Resources and utils
import {Resources} from '../core/utils/resources';

// Services
import {AccessTokenBody, AccessTokenService} from '../core/user/access-token-service';

@Injectable({
    providedIn: 'root'
})
export class AdsService {

    selectedItem: Item;

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService) {
    }

    setSelectedItem(item: Item) {
        this.selectedItem = item;
    }

    getSelectedItem(): Item {
        return this.selectedItem;
    }

    reset() {
        this.selectedItem = null;
    }

    // Limit 1, right now we only display one offered item
    findAdsItems(): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                params = params.append('limit', '1');

                this.httpClient.get(Resources.Constants.API.ITEMS_MYOFFEREDITEMS, {params: params})
                    .subscribe((items: Item[]) => {
                        resolve(items);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    setStatus(itemId: string, newStatus: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['newStatus'] = newStatus;

                this.httpClient.put(Resources.Constants.API.ITEMS_MYOFFEREDITEMS + itemId + '/status', body, {headers: headers})
                    .subscribe((item: Item) => {
                        resolve(item);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    setEnd(itemId: string, newEnd: Date): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['end'] = newEnd.toISOString();

                this.httpClient.put(Resources.Constants.API.ITEMS_MYOFFEREDITEMS + itemId + '/end', body, {headers: headers})
                    .subscribe((item: Item) => {
                        resolve(item);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

}
