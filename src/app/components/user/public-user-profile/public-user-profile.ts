import {Component, Input, OnChanges, SimpleChange, Output, EventEmitter} from '@angular/core';

import {forkJoin} from 'rxjs';

// Model
import {User} from '../../../services/model/user/user';

// Utils
import {Resources} from '../../../services/core/utils/resources';
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {Language, LanguagesService} from '../../../services/core/languages/languages-service';
import {UserSessionService} from '../../../services/core/user/user-session-service';

export interface LifestyleDisplay {
    label: string;
    key: string;
    keyValue: string;
}

@Component({
    templateUrl: 'public-user-profile.html',
    styleUrls: ['./public-user-profile.scss'],
    selector: 'app-public-user-profile'
})
export class PublicUserProfileComponent implements OnChanges {

    RESOURCES: any = Resources.Constants;

    @Output() notifyLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() user: User;

    @Input() displaySensitive: boolean = false;

    @Input() displayStarred: boolean = false;

    // User is currently watching is ads and is profile
    @Input() advertiserView: boolean = false;

    languages: Language[];
    hasMoreLanguages: boolean = false;

    mutualLikes: string[];

    lifestyle: LifestyleDisplay[] = null;

    constructor(private userSessionService: UserSessionService,
                private languagesService: LanguagesService) {
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {

        this.initLifestyle().then((result: LifestyleDisplay[]) => {
            this.lifestyle = result;
        });

        const promises = new Array();
        promises.push(this.initLanguages());
        promises.push(this.initMutualLikes());

        forkJoin(promises).subscribe(
            (data: any[]) => {
                this.notifyLoaded.emit(true);
            }
        );
    }

    private initLanguages(): Promise<{}> {
        return new Promise((resolve) => {
            if (this.user != null && this.user.description != null && this.user.description.languages != null) {
                this.languagesService.findLanguages(this.user.description.languages).then((results: Language[]) => {
                    if (!Comparator.isEmpty(results) && results.length > this.RESOURCES.LANGUAGE.MAX_SELECTED_LANGUAGES) {
                        this.languages = results.splice(0, this.RESOURCES.LANGUAGE.MAX_SELECTED_LANGUAGES);
                        this.hasMoreLanguages = true;
                    } else {
                        this.languages = results;
                        this.hasMoreLanguages = false;
                    }

                    resolve();
                }, (error: any) => {
                    this.languages = new Array();
                    this.hasMoreLanguages = false;

                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    private initMutualLikes(): Promise<{}> {
        const results: string[] = new Array();

        const currentUser: User = this.userSessionService.getUser();

        return new Promise((resolve) => {
            if (this.user != null && !Comparator.isEmpty(this.user.facebook.likes) && this.user.facebook.likes.data) {
                for (let i: number = 0; i < this.user.facebook.likes.data.length; i++) {
                    const like: string = this.user.facebook.likes.data[i].name;

                    this.isLikeMutual(currentUser, like).then((result: boolean) => {
                        if (result) {
                            results.push(like);
                        }
                    });
                }
            }

            this.mutualLikes = results;

            resolve();
        });
    }

    private isLikeMutual(currentUser: User, like: string): Promise<{}> {
        return new Promise((resolve) => {
            if (Comparator.isEmpty(currentUser.facebook.likes) || Comparator.isEmpty(currentUser.facebook.likes.data)) {
                resolve(false);
            } else {
                for (let i: number = 0; i < currentUser.facebook.likes.data.length; i++) {
                    const userLike: string = currentUser.facebook.likes.data[i].name;

                    if (Comparator.equals(userLike, like)) {
                        resolve(true);
                    }
                }

                resolve(false);
            }
        });
    }

    hasEducation(): boolean {
        return !Comparator.isEmpty(this.user.description) && !Comparator.isStringEmpty(this.user.description.school);
    }

    hasWork(): boolean {
        return !Comparator.isEmpty(this.user.description) && !Comparator.isStringEmpty(this.user.description.employer);
    }

    hasBio(): boolean {
        return !Comparator.isStringEmpty(this.user.description.bio);
    }

    hasMutualLikes(): boolean {
        return !Comparator.isEmpty(this.mutualLikes);
    }

    hasLanguages(): boolean {
        return !Comparator.isEmpty(this.languages);
    }

    phoneShoudlBeDisplayed(): boolean {
        return this.displaySensitive && !Comparator.isEmpty(this.user.description.phone) &&
            this.user.description.phone.display && !Comparator.isStringEmpty(this.user.description.phone.number);
    }

    hasSpotifyEnabled(): boolean {
        return !Comparator.isEmpty(this.user) && !Comparator.isEmpty(this.user.description) &&
            !Comparator.isEmpty(this.user.description.spotify) && this.user.description.spotify.display;
    }

    private initLifestyle(): Promise<{}> {
        return new Promise((resolve) => {
            let result: LifestyleDisplay[] = null;

            if (this.hasLifestyle()) {
                result = new Array();

                if (!Comparator.isStringEmpty(this.user.description.lifestyle.cleanliness)) {
                    result.push({
                        label: 'USER_PROFILE.LIFESTYLE.CLEANLINESS.TITLE',
                        key: 'CLEANLINESS',
                        keyValue: this.user.description.lifestyle.cleanliness
                    });
                }

                if (!Comparator.isStringEmpty(this.user.description.lifestyle.guests)) {
                    result.push({
                        label: 'USER_PROFILE.LIFESTYLE.GUESTS.TITLE',
                        key: 'GUESTS',
                        keyValue: this.user.description.lifestyle.guests
                    });
                }

                if (!Comparator.isStringEmpty(this.user.description.lifestyle.party)) {
                    result.push({
                        label: 'USER_PROFILE.LIFESTYLE.PARTY.TITLE',
                        key: 'PARTY',
                        keyValue: this.user.description.lifestyle.party
                    });
                }

                if (!Comparator.isStringEmpty(this.user.description.lifestyle.food)) {
                    result.push({label: 'USER_PROFILE.LIFESTYLE.FOOD.TITLE', key: 'FOOD', keyValue: this.user.description.lifestyle.food});
                }
            }

            resolve(result);
        });
    }

    hasLifestyle(): boolean {
        return !Comparator.isEmpty(this.user) && !Comparator.isEmpty(this.user.description) &&
            !Comparator.isEmpty(this.user.description.lifestyle);
    }

    hasLifestyleObjects(): boolean {
        return Comparator.hasElements(this.lifestyle);
    }

    hasHobbies(): boolean {
        return !Comparator.isEmpty(this.user.description) && !Comparator.isEmpty(this.user.description.hobbies) && (
            Comparator.hasElements(this.user.description.hobbies.sports) ||
            Comparator.hasElements(this.user.description.hobbies.arts) ||
            Comparator.hasElements(this.user.description.hobbies.food) ||
            Comparator.hasElements(this.user.description.hobbies.places)
        );
    }
}
