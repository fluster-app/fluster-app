import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';

import {forkJoin} from 'rxjs';

// Model
import {Item} from '../model/item/item';
import {ItemUser, ItemInterest} from '../model/item/item-user';
import {User} from '../model/user/user';

// Resources
import {Resources} from '../core/utils/resources';
import {Comparator} from '../core/utils/utils';

// Service
import {LocationUtilService} from '../core/location/location-util-service';
import {AccessTokenBody, AccessTokenService} from '../core/user/access-token-service';

// Since the main search return populated item we do not need to find it again on the appointments and details view
@Injectable({
    providedIn: 'root'
})
export class ItemUsersService {

    constructor(private httpClient: HttpClient,
                private locationUtilService: LocationUtilService,
                private accessTokenService: AccessTokenService) {

    }

    calculateInterests(user: User, item: Item): Promise<{}> {

        return new Promise((resolve, reject) => {

            if (!Comparator.isEmpty(item) && !Comparator.isEmpty(user.userParams.interests)) {
                const promises = new Array();

                for (let i: number = 0; i < user.userParams.interests.interests.length; i++) {
                    promises.push(this.locationUtilService.calculateShortestRoute(item, user.userParams.interests.interests[i]));
                }

                if (Comparator.hasElements(promises)) {

                    const itemInterests: ItemInterest[] = new Array<ItemInterest>();

                    forkJoin(promises)
                        .subscribe((valuesCalculated: number[]) => {

                            for (let i: number = 0; i < valuesCalculated.length; i++) {
                                if (valuesCalculated[i] != null) {
                                    const itemInterest: ItemInterest = new ItemInterest(user.userParams.interests.interests[i],
                                        valuesCalculated[i]);
                                    itemInterests.push(itemInterest);
                                }
                            }

                            resolve(itemInterests);
                        });
                } else {
                    reject();
                }
            } else {
                reject();
            }
        });
    }

    saveItemUser(itemUser: ItemUser): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['itemUser'] = itemUser;

                this.httpClient.post(Resources.Constants.API.ITEM_USERS, body, {headers: headers})
                    .subscribe((result: ItemUser) => {
                        resolve(result);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    findItemUser(item: Item): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const params: HttpParams = await this.accessTokenService.getHttpParams();

                this.httpClient.get(Resources.Constants.API.ITEM_USERS + item._id, {params: params})
                    .subscribe((result: ItemUser) => {
                        resolve(result);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    findItemUsers(items: Item[]): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                const itemIdList: string[] = new Array();
                for (let i = 0; i < items.length; i++) {
                    itemIdList.push(items[i]._id);
                }

                params = params.append('itemIdList', itemIdList.join());

                this.httpClient.get(Resources.Constants.API.ITEM_USERS, {params: params})
                    .subscribe((results: ItemUser[]) => {
                        resolve(results);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

}
