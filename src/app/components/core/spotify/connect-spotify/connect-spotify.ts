import {
    Component, AfterViewInit, Output, EventEmitter, OnDestroy, Input, OnChanges, SimpleChange,
    NgZone
} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

import {Subscription} from 'rxjs';

import {InAppBrowser, InAppBrowserObject} from '@ionic-native/in-app-browser/ngx';

import {TranslateService} from '@ngx-translate/core';

// Model
import {SpotifyAuthenticationState} from '../../../../services/types/spotify';
import {UserDescriptionSpotify} from '../../../../services/model/user/user';

// Resources and utils
import {Resources} from '../../../../services/core/utils/resources';
import {Comparator, Validator} from '../../../../services/core/utils/utils';

// Services
import {SpotifyService} from '../../../../services/core/spotify/spotify-service';

@Component({
    templateUrl: 'connect-spotify.html',
    styleUrls: ['./connect-spotify.scss'],
    selector: 'app-connect-spotify'
})
export class ConnectSpotifyComponent implements AfterViewInit, OnDestroy, OnChanges {

    RESOURCES: any = Resources.Constants;

    @Input() userSpotify: UserDescriptionSpotify;

    @Output() notifyResult: EventEmitter<UserDescriptionSpotify> = new EventEmitter<UserDescriptionSpotify>();

    private spotifyAuthenticationSubscription: Subscription;
    private spotifyInAppBrowser: InAppBrowserObject;

    loading: boolean = false;

    spotifyEnabled: boolean = false;

    constructor(private inAppBrowser: InAppBrowser,
                private zone: NgZone,
                private translateService: TranslateService,
                private spotifyService: SpotifyService) {
    }

    ngAfterViewInit(): void {
        this.spotifyAuthenticationSubscription = this.spotifyService.watchLoginState()
            .subscribe((loginState: SpotifyAuthenticationState) => {

            if (!Comparator.isEmpty(loginState) && Comparator.isStringEmpty(loginState.error) &&
                Comparator.equals(this.spotifyService.getAuthenticationStateCheck(), loginState.state)) {
                this.findSpotifyArtists(loginState);
            } else {
                this.spotifyEnabled = false;
            }

            if (this.spotifyInAppBrowser != null) {
                this.spotifyInAppBrowser.close();
            }
        });
    }

    ngOnDestroy() {
        if (this.spotifyAuthenticationSubscription != null) {
            this.spotifyAuthenticationSubscription.unsubscribe();
        }
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        this.spotifyEnabled = !Comparator.isEmpty(this.userSpotify) && this.userSpotify.display;
    }

    connectSpotify($event: boolean) {

        // ngModelChange instead of ionChange and this check are needed in order to avoid loops and events automatically triggered
        // when we comeback from the inAppBrowser
        if (this.spotifyEnabled === $event) {
            return;
        }

        if (!this.spotifyEnabled) {
            if (Comparator.isEmpty(this.userSpotify)) {
                this.connectSpotifyWithInAppBrowser();
            } else {
                this.refreshSpotify();
            }
        } else {
            this.hideSpotify();
        }
    }

    private connectSpotifyWithInAppBrowser() {
        let spotifyUrl: string = this.RESOURCES.SPOTIFY.CONNECT_URL + '?';

        spotifyUrl += 'response_type=' + this.RESOURCES.SPOTIFY.RESPONSE_TYPE;
        spotifyUrl += '&client_id=' + this.RESOURCES.SPOTIFY.CLIENT_ID;
        spotifyUrl += '&scope=' + this.RESOURCES.SPOTIFY.SCOPE;
        spotifyUrl += '&redirect_uri=' + this.RESOURCES.SPOTIFY.REDIRECT_URL;

        const state: string = Validator.generateRandomString(16);

        // Save authentication state to test the result after the redirect of Spotify to avoid spam
        this.spotifyService.setAuthenticationStateCheck(state);

        spotifyUrl += '&state=' + state;

        const backButtonText: string = this.translateService.instant('CORE.BACK');

        this.spotifyInAppBrowser = this.inAppBrowser.create(spotifyUrl, '_blank', {
            location: 'no',
            clearcache: 'yes',
            clearsessioncache: 'yes',
            closebuttoncaption: backButtonText,
            shouldPauseOnSuspend: 'yes'
        });

        this.spotifyInAppBrowser.on('exit').subscribe(() => {
            if (!this.loading) {
                // User pressed close. If loading mean inAppBrowser was close after deep linking/redirect
                this.zone.run(() => {
                    this.spotifyEnabled = false;
                });
            }
        });
    }

    private findSpotifyArtists(loginState: SpotifyAuthenticationState) {
        this.loading = true;

        this.spotifyService.initSpotify(loginState).then((userSpotifyId: Communication.UserSpotifyId) => {
            this.loading = false;

            this.emitNewUserSpotify(userSpotifyId.userSpotifyId);
        }, (errorResponse: HttpErrorResponse) => {
            this.loading = false;
            this.spotifyEnabled = false;
        });
    }

    private refreshSpotify() {
        this.loading = true;
        this.notifyResult.emit(null);

        this.spotifyService.refreshSpotify(this.userSpotify.spotify).then((userSpotifyId: Communication.UserSpotifyId) => {
            this.loading = false;

            this.emitNewUserSpotify(userSpotifyId.userSpotifyId);
        }, (errorResponse: HttpErrorResponse) => {
            this.loading = false;
        });
    }

    private emitNewUserSpotify(spotifyId: string) {
        this.userSpotify = new UserDescriptionSpotify();
        this.userSpotify.spotify = spotifyId;
        this.notifyResult.emit(this.userSpotify);
    }

    private hideSpotify() {
        if (!Comparator.isEmpty(this.userSpotify)) {
            this.userSpotify.display = false;
        }

        this.notifyResult.emit(this.userSpotify);
    }
}
