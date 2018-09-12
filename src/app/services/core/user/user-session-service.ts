import {Injectable} from '@angular/core';

import {Observable, Subject} from 'rxjs';

// Model
import {User} from '../../model/user/user';

@Injectable({
    providedIn: 'root'
})
export class UserSessionService {

    user: User;

    private userShouldBeSaved: boolean = false;

    private userModifiedSource: Subject<User> = new Subject<User>();
    userModified: Observable<User> = this.userModifiedSource.asObservable();

    sessionInitialized: boolean = false;

    constructor() {
    }

    setUser(new_user: User) {
        this.user = new_user;
    }

    setUserToSave(new_user: User) {
        this.user = new_user;
        this.user.updatedAt = new Date();

        this.userShouldBeSaved = true;
    }

    getUser(): User {
        return this.user;
    }

    shouldUserBeSaved(): boolean {
        return this.userShouldBeSaved;
    }

    reset() {
        this.user = null;
        this.sessionInitialized = false;
    }

    emit() {
        this.userModifiedSource.next(this.getUser());
    }

    userWasSaved() {
        this.userShouldBeSaved = false;
    }
}
