import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';

// Model
import MongoUpdate = Communication.MongoUpdate;

// Resources
import {Resources} from '../core/utils/resources';
import {Comparator} from '../core/utils/utils';
import {AccessTokenBody, AccessTokenService} from '../core/user/access-token-service';

@Injectable({
    providedIn: 'root'
})
export class LikeService {

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService) {

    }

    likeDislike(itemId: string, like: boolean): Promise<{}> {

        return new Promise(async (resolve, reject) => {
            if (Comparator.isStringEmpty(itemId)) {
                reject();
            } else {
                try {
                    const headers: HttpHeaders = new HttpHeaders();
                    headers.append('Content-Type', 'application/json');

                    const body: AccessTokenBody = await this.accessTokenService.getRequestBody();

                    this.httpClient.put(Resources.Constants.API.LIKES + itemId + '/' + (like ? 'like' : 'dislike'), body, {headers: headers})
                        .subscribe((result: MongoUpdate) => {
                            resolve();
                        }, (errorResponse: HttpErrorResponse) => {
                            reject(errorResponse);
                        });
                } catch (err) {
                    reject(err);
                }
            }
        });
    }


    getLikeDislike(itemHashId: string, like: boolean): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const params: HttpParams = await this.accessTokenService.getHttpParams();

                this.httpClient.get(Resources.Constants.API.LIKES + itemHashId + '/' + (like ? 'like' : 'dislike'), {params: params})
                    .subscribe((response: Communication.LikeStatus) => {
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
