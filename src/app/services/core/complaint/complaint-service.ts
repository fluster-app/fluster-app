import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';

// Model
import {User} from '../../model/user/user';
import {Item} from '../../model/item/item';

// Resources and utils
import {Resources} from '../../core/utils/resources';
import {Comparator} from '../utils/utils';
import {AccessTokenBody, AccessTokenService} from '../user/access-token-service';

@Injectable({
    providedIn: 'root'
})
export class ComplaintService {

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService) {

    }

    itemComplaint(item: Item, reason: string): Promise<{}> {
        return this.postComplaint('item', item._id, null, reason);
    }

    userComplaint(complaintUser: User, reason: string): Promise<{}> {
        return this.postComplaint('user', null, complaintUser._id, reason);
    }

    private postComplaint(postSubPath: string, itemId: string, complaintUserId: string, reason: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['reason'] = reason;

                if (!Comparator.isStringEmpty(itemId)) {
                    body['itemId'] = itemId;
                }

                if (!Comparator.isStringEmpty(complaintUserId)) {
                    body['complaintUserId'] = complaintUserId;
                }

                this.httpClient.post(Resources.Constants.API.COMPLAINTS + postSubPath, body, {headers: headers})
                    .subscribe((result: boolean) => {
                        resolve(result);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

}
