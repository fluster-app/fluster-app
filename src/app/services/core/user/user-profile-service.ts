import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';

// Model
import {AccessToken, User} from '../../model/user/user';

// Resources
import {Resources} from '../utils/resources';
import {Converter} from '../utils/utils';

// Services
import {UserSessionService} from './user-session-service';
import {AccessTokenBody, AccessTokenService} from './access-token-service';

@Injectable({
    providedIn: 'root'
})
export class UserProfileService {

    private savedUser: Subject<User> = new Subject<User>();

    constructor(private httpClient: HttpClient,
                private userSessionService: UserSessionService,
                private accessTokenService: AccessTokenService) {

    }

    private save(user: User): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const accessToken: AccessToken = this.accessTokenService.getAccessToken();

                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['userParams'] = user.userParams;
                body['newStatus'] = user.status;
                body['description'] = user.description;
                body['gender'] = user.facebook.gender;

                if (Converter.getDateObj(user.facebook.birthday) !== null) {
                    body['birthday'] = Converter.getDateObj(user.facebook.birthday).getTime();
                }

                this.httpClient.put(Resources.Constants.API.PROFILES + accessToken.userId + '/edit', body, {headers: headers})
                    .subscribe((updatedUser: User) => {
                        this.userSessionService.setUser(updatedUser);
                        this.userSessionService.userWasSaved();
                        this.userSessionService.emit();

                        resolve(updatedUser);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    saveIfModified(user: User): Promise<{}> {
        return new Promise((resolve, reject) => {
            if (this.userSessionService.shouldUserBeSaved()) {
                this.save(user).then((updatedUser: User) => {
                    this.savedUser.next(updatedUser);
                    resolve(updatedUser);
                }, (response: HttpErrorResponse) => {
                    reject(response);
                });
            } else {
                resolve(user);
            }
        });
    }

    watchSavedUser(): Observable<User> {
        return this.savedUser.asObservable();
    }

    findPublicProfile(userId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const params: HttpParams = await this.accessTokenService.getHttpParams();

                this.httpClient.get(Resources.Constants.API.PROFILES + userId, {params: params})
                    .subscribe((response: User) => {
                        resolve(response);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    anonymize(user: User): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();

                this.httpClient.put(Resources.Constants.API.PROFILES + user._id + '/anonymize', body, {headers: headers})
                    .subscribe((success: Communication.AnonymizeUser) => {
                        resolve(success);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }
}
