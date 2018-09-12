import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';

// Model
import {AccessTokenBody, AccessTokenService} from '../user/access-token-service';
import {Product} from '../../model/product/product';
import {Subscription} from '../../model/user/user';

// Utils
import {Resources} from '../utils/resources';

// Services
import {SubscriptionService} from '../user/subscription-service';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService,
                private subscriptionService: SubscriptionService) {

    }

    findProducts(browse: boolean): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();

                params = params.append('browse', '' + browse);

                this.httpClient.get(Resources.Constants.API.PRODUCTS, {params: params})
                    .subscribe((data: Product[]) => {
                        resolve(data);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    createSubscription(product: Product, status: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['productId'] = product._id;
                body['status'] = status;

                this.httpClient.post(Resources.Constants.API.SUBSCRIPTIONS, body, {headers: headers})
                    .subscribe((createdSubsription: Subscription) => {
                        this.subscriptionService.setSubscription(createdSubsription);
                        resolve();
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

}
