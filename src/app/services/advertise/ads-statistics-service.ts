import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';

// Model
import {Item} from '../model/item/item';

// Resources and utils
import {Resources} from '../core/utils/resources';
import {Comparator, Converter} from '../core/utils/utils';
import {AccessTokenService} from '../core/user/access-token-service';

@Injectable({
    providedIn: 'root'
})
export class AdsStatisticsService {

    private notifyAdsStatisticsChangedSource: Subject<number> = new Subject<number>();
    notifyAdsStatisticsChanged: Observable<number> = this.notifyAdsStatisticsChangedSource.asObservable();

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService) {
    }

    calculateTargetedUsers(item: Item) {

        this.findTotalTargetedUsers(item).then((statistics: Communication.TargetedUsersStatistics) => {
            this.notifyAdsStatisticsChangedSource.next(statistics.users);
        }, (errorResponse: Communication.TargetedUsersStatisticsError) => {
            if (errorResponse != null && !Comparator.isStringEmpty(errorResponse._body)) {
                const error: Communication.ErrorBodyResponse = JSON.parse(errorResponse._body);

                if (error != null &&
                    error.error.code === Resources.Constants.STATISTICS.TARGETED_USERS.MONGO_ERR_CODE_AGGREGATION_MAX_EXCEEDS) {
                    this.notifyAdsStatisticsChangedSource.next(Resources.Constants.STATISTICS.TARGETED_USERS.MAX_TARGETED_USERS);
                } else {
                    this.notifyAdsStatisticsChangedSource.next(0);
                }
            } else {
                this.notifyAdsStatisticsChangedSource.next(0);
            }
        });
    }

    private findTotalTargetedUsers(item: Item): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            const params: HttpParams = await this.getItemSearchParams(item);

            this.httpClient.get(Resources.Constants.API.STATISTICS + 'targetedusers', {params: params})
                .subscribe((statistics: Communication.TargetedUsersStatistics) => {
                    resolve(statistics);
                }, (errorResponse: Communication.TargetedUsersStatisticsError) => {
                    reject(errorResponse);
                });
        });
    }

    public async getItemSearchParams(item: Item): Promise<HttpParams> {
        try {
            let params: HttpParams = await this.accessTokenService.getHttpParams();

            params = params.append('longitude', '' + item.address.location.coordinates[0]);
            params = params.append('latitude', '' + item.address.location.coordinates[1]);

            params = params.append('type', item.attributes.type);
            params = params.append('furnished', '' + item.attributes.furnished);

            if (!Comparator.isNumberNullOrZero(item.attributes.rooms)) {
                params = params.append('rooms', '' + item.attributes.rooms);
            }

            if (!Comparator.isNumberNullOrZero(item.attributes.price.gross)) {
                params = params.append('price', '' + item.attributes.price.gross);
            }

            if (item.attributes.disabledFriendly != null) {
                params = params.append('disabledFriendly', '' + item.attributes.disabledFriendly);
            }

            if (item.attributes.petsAllowed != null) {
                params = params.append('petsAllowed', '' + item.attributes.petsAllowed);
            }

            if (item.attributes.availability.begin != null) {
                params = params.append('availablebegin', Converter.getDateObj(item.attributes.availability.begin).toISOString());
            }

            if (item.attributes.availability.end != null) {
                params = params.append('availableend', Converter.getDateObj(item.attributes.availability.end).toISOString());
            }

            params = params.append('ageMin', '' + item.userLimitations.age.min);
            params = params.append('ageMax', '' + item.userLimitations.age.max);
            params = params.append('gender', item.userLimitations.gender);

            return Promise.resolve(params);
        } catch (err) {
            return Promise.reject(err);
        }
    }
}
