import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';

// Model
import {SpotifyAuthenticationState} from '../../types/spotify';

// Resources
import {Resources} from '../utils/resources';

// Services
import {AccessTokenBody, AccessTokenService} from '../user/access-token-service';
import {UserSpotify} from '../../model/user/user';

@Injectable({
    providedIn: 'root'
})
export class SpotifyService {

    private authenticationState: SpotifyAuthenticationState;
    private subject = new Subject<SpotifyAuthenticationState>();

    private authenticationStateCheck: string;

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService) {

    }

    setAuthenticationState(code: string, state: string, error: string) {
        this.authenticationState = {code: code, state: state, error: error};
        this.subject.next(this.authenticationState);
    }

    watchLoginState(): Observable<SpotifyAuthenticationState> {
        return this.subject.asObservable();
    }

    setAuthenticationStateCheck(new_state: string) {
        this.authenticationStateCheck = new_state;
    }

    getAuthenticationStateCheck(): string {
        return this.authenticationStateCheck;
    }

    initSpotify(loginState: SpotifyAuthenticationState): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['code'] = loginState.code;
                body['redirectUri'] = Resources.Constants.SPOTIFY.REDIRECT_URL;

                this.httpClient.post(Resources.Constants.API.SPOTIFY, body, {headers: headers})
                    .subscribe((result: Communication.UserSpotifyId) => {
                        resolve(result);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    findUserSpotify(spotifyId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const params: HttpParams = await this.accessTokenService.getHttpParams();

                this.httpClient.get(Resources.Constants.API.SPOTIFY + spotifyId, {params: params})
                    .subscribe((result: UserSpotify) => {
                        resolve(result);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    displayUserSpotifyArtist(userSpotifyId: string, artistObjectId: string, displayArtist: boolean): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['artistObjectId'] = artistObjectId;
                body['displayArtist'] = displayArtist;

                this.httpClient.put(Resources.Constants.API.SPOTIFY + userSpotifyId, body, {headers: headers})
                    .subscribe((result: Communication.MongoUpdate) => {
                        resolve();
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    refreshSpotify(userSpotifyId: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();

                this.httpClient.put(Resources.Constants.API.SPOTIFY + userSpotifyId + '/refresh', body, {headers: headers})
                    .subscribe((result: Communication.UserSpotifyId) => {
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
