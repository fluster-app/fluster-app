import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';

// Model
import {Item} from '../../model/item/item';
import {Reward} from '../../model/reward/reward';

// Resources and utils
import {Resources} from '../utils/resources';

// Services
import {AccessTokenBody, AccessTokenService} from '../user/access-token-service';

@Injectable({
    providedIn: 'root'
})
export class RewardService {

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService) {

    }

    createContestReward(item: Item): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['itemId'] = item._id;
                body['itemType'] = item.attributes.type;

                this.httpClient.post(Resources.Constants.API.REWARDS, body, {headers: headers})
                    .subscribe((createdReward: Reward) => {
                        resolve(createdReward);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

}
