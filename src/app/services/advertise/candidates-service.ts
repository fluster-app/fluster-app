import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';

// Model
import {User} from '../model/user/user';
import {Item, ItemStars} from '../model/item/item';

// Resources and utils
import {Resources} from '../core/utils/resources';

// Services
import {AccessTokenBody, AccessTokenService} from '../core/user/access-token-service';
import {AdsStatisticsService} from './ads-statistics-service';

@Injectable({
    providedIn: 'root'
})
export class CandidatesService {

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService,
                private adsStatisticsService: AdsStatisticsService) {
    }

    findCandidates(item: Item, pageIndex: number): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            let params: HttpParams = await this.adsStatisticsService.getItemSearchParams(item);

            params = params.append('pageIndex', '' + pageIndex);

            this.httpClient.get(Resources.Constants.API.CANDIDATES, {params: params})
                .subscribe((items: User[]) => {
                    resolve(items);
                }, (errorResponse: HttpErrorResponse) => {
                    reject(errorResponse);
                });
        });
    }

    starCandidate(itemId: string, candidateId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['candidateId'] = candidateId;
                body['itemId'] = itemId;

                this.httpClient.post(Resources.Constants.API.STARS, body, {headers: headers})
                    .subscribe((result: ItemStars) => {
                        resolve(result);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    findStars(itemId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                params = params.append('itemId', itemId);

                this.httpClient.get(Resources.Constants.API.STARS, {params: params})
                    .subscribe((starredCandidates: string[]) => {
                        resolve(starredCandidates);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }
}
