import {Component, Input, OnChanges, SimpleChange} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

// Utils
import {Comparator} from '../../../../services/core/utils/utils';

// Services
import {SpotifyService} from '../../../../services/core/spotify/spotify-service';
import {UserSpotify, UserSpotifyArtist} from '../../../../services/model/user/user';

@Component({
    templateUrl: 'display-spotify.html',
    styleUrls: ['./display-spotify.scss'],
    selector: 'app-display-spotify'
})
export class DisplaySpotifyComponent implements OnChanges {

    @Input() userSpotifyId: string;
    @Input() editable: boolean = false;

    loading: boolean = false;

    userSpotify: UserSpotify;

    displayedArtistIds: string[] = new Array();

    constructor(private spotifyService: SpotifyService) {

    }

    ngOnChanges(changes: { [ propName: string]: SimpleChange }) {

        if (Comparator.isStringEmpty(this.userSpotifyId) || !Comparator.isEmpty(this.userSpotify)) {
            return;
        }

        this.loading = true;

        this.spotifyService.findUserSpotify(this.userSpotifyId).then((result: UserSpotify) => {
            this.userSpotify = result;

            this.loading = false;
        }, (errorResponse: HttpErrorResponse) => {
            this.loading = false;
            this.userSpotify = null;
        });
    }

    hasArtists(): boolean {
        return !Comparator.isEmpty(this.userSpotify) && Comparator.hasElements(this.userSpotify.artists);
    }

    hasImages(artist: UserSpotifyArtist): boolean {
        return Comparator.hasElements(artist.images);
    }

    getCover(artist: UserSpotifyArtist): string {
        // If we have more than one cover, we don't use the first one which is the biggest one 640, but the 2nd one, often 320
        return artist.images[artist.images.length > 1 ? 1 : 0].url;
    }

    chgDisplayArtist(artist: UserSpotifyArtist) {
        if (!this.editable || (this.displayedArtistIds.length <= 1 && artist.display)) {
            // If not editable and at least one should be displayed
            return;
        }

        this.spotifyService.displayUserSpotifyArtist(this.userSpotifyId, artist._id, !artist.display).then(() => {
            artist.display = !artist.display;

            if (!artist.display) {
                this.displayedArtistIds.splice(this.displayedArtistIds.indexOf(artist._id), 1);
            }
        }, (errorResponse: HttpErrorResponse) => {
           // Do nothing
        });
    }

    countDisplayed(artist: UserSpotifyArtist) {
        if (artist.display && this.displayedArtistIds.indexOf(artist._id) === -1) {
            this.displayedArtistIds.push(artist._id);
        }
    }
}
