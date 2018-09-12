import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';

// Model
import {Item} from '../model/item/item';
import {User, UserItemRoom} from '../model/user/user';

// Resources
import {Resources} from '../core/utils/resources';
import {Comparator, Converter} from '../core/utils/utils';
import {AccessTokenService} from '../core/user/access-token-service';

@Injectable({
    providedIn: 'root'
})
export class ItemsService {

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService) {
    }

    findNewItems(user: User, pageIndex: number, onlyDisliked: boolean, countDisliked: number): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                params = params.append('age', '' + Converter.getAge(user.facebook.birthday));
                params = params.append('gender', user.facebook.gender);
                params = params.append('longitude', '' + user.userParams.address.location.coordinates[0]);
                params = params.append('latitude', '' + user.userParams.address.location.coordinates[1]);
                params = params.append('distance', '' + user.userParams.address.distance);

                params = this.addOptionalParam(params, 'type', user.userParams.item.type);
                params = this.addOptionalBooleanParam(params, 'furnished', user.userParams.item.furnished);
                params = this.addOptionalParam(params, 'rooms', UserItemRoom.toStringCommaSeparatedParameters(user.userParams.item.room));
                params = this.addOptionalNumberParam(params, 'minPrice', user.userParams.item.budget.min);
                params = this.addOptionalNumberParam(params, 'maxPrice', user.userParams.item.budget.max);
                params = this.addOptionalBooleanNoFalseParam(params, 'disabledFriendly', user.userParams.item.disabledFriendly);
                params = this.addOptionalBooleanNoFalseParam(params, 'petsAllowed', user.userParams.item.petsAllowed);
                params = this.addOptionalBooleanNoFalseParam(params, 'onlyDisliked', onlyDisliked);

                if (user.userParams.item.availability.begin != null) {
                    params = this.addOptionalParam(params, 'availablebegin',
                        Converter.getDateObj(user.userParams.item.availability.begin).toISOString());
                }

                if (user.userParams.item.availability.end) {
                    params = this.addOptionalParam(params, 'availableend',
                        Converter.getDateObj(user.userParams.item.availability.end).toISOString());
                }

                params = params.append('pageIndex', '' + pageIndex);
                params = params.append('countDisliked', '' + countDisliked);

                this.httpClient.get(Resources.Constants.API.ITEMS, {params: params})
                    .subscribe((response: Item[]) => {
                        resolve(response);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    findMyBookmarksItems(pageIndex: number, onlyPublished: boolean): Promise<{}> {
        return this.findMyItems(pageIndex, true, onlyPublished, false);
    }

    findMyAppointmentsItems(pageIndex: number, allStatus: boolean): Promise<{}> {
        return this.findMyItems(pageIndex, false, false, allStatus);
    }

    private findMyItems(pageIndex: number, bookmarksOnly: boolean, onlyPublished: boolean, allStatus: boolean): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                params = params.append('pageIndex', '' + pageIndex);
                params = params.append('bookmark', '' + bookmarksOnly);
                params = params.append('onlyPublished', '' + onlyPublished);
                params = params.append('allStatus', '' + allStatus);

                this.httpClient.get(Resources.Constants.API.MYITEMS, {params: params})
                    .subscribe((response: Item[]) => {
                        resolve(response);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    private addOptionalParam(params: HttpParams, key: string, value: string): HttpParams {
        return !Comparator.isEmpty(value) ? params.append(key, value) : params;
    }

    private addOptionalNumberParam(params: HttpParams, key: string, value: number): HttpParams {
        return value !== null ? params.append(key, '' + value) : params;
    }

    private addOptionalBooleanParam(params: HttpParams, key: string, value: boolean): HttpParams {
        return value !== null ? params.append(key, '' + value) : params;
    }

    private addOptionalBooleanNoFalseParam(params: HttpParams, key: string, value: boolean): HttpParams {
        return value !== null && value ? params.append(key, '' + value) : params;
    }

    findItem(itemHashId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const params: HttpParams = await this.accessTokenService.getHttpParams();

                this.httpClient.get(Resources.Constants.API.ITEMS + itemHashId, {params: params})
                    .subscribe((response: Item) => {
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
