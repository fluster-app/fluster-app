import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';

// Model
import {AccessToken} from '../../model/user/user';

export interface AccessTokenBody {
    apiAccessToken: string;
    userId: string;
}

@Injectable({
    providedIn: 'root'
})
export class AccessTokenService {

    private redirectSubject: Subject<string> = new Subject<string>();

    accessToken: AccessToken;

    constructor() {

    }

    setAccessToken(new_access_token: AccessToken) {
        this.accessToken = new_access_token;
    }

    getAccessToken(): AccessToken {
        return this.accessToken;
    }

    reset() {
        this.accessToken = null;
    }

    async getHttpParams(): Promise<HttpParams> {
        return new Promise<HttpParams>((resolve, reject) => {
            if (!this.accessToken) {
                this.redirectSubject.next('/login');
                reject();
            } else {
                let params: HttpParams = new HttpParams();
                params = params.set('apiAccessToken', this.accessToken.apiAccessToken);
                params = params.append('userId', this.accessToken.userId);

                resolve(params);
            }
        });
    }

    async getRequestBody(): Promise<AccessTokenBody> {
        return new Promise<AccessTokenBody>((resolve, reject) => {
            if (!this.accessToken) {
                this.redirectSubject.next('/login');
                reject();
            } else {
                const body: AccessTokenBody = {
                    apiAccessToken: this.accessToken.apiAccessToken,
                    userId: this.accessToken.userId
                };

                resolve(body);
            }
        });
    }

    watchRedirect(): Observable<string> {
        return this.redirectSubject.asObservable();
    }
}
