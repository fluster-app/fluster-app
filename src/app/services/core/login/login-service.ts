import {Injectable} from '@angular/core';

import {Observable, Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    private subject: Subject<boolean> = new Subject<boolean>();

    // When using Facebook plugin, going back to the login view init it again
    // Futhermore, can't display a standard loading for that reason too
    private interacting: boolean = false;

    private code: string;
    private state: string;

    constructor() {

    }

    setInteracting(state: boolean) {
        this.interacting = state;
        this.subject.next(this.interacting);
    }

    isInteracting(): boolean {
        return this.interacting;
    }

    watchLoginInteracting(): Observable<boolean> {
        return this.subject.asObservable();
    }

    setCode(code: string) {
        this.code = code;
    }

    setState(state: string) {
        this.state = state;
    }

    getState(): string {
        return this.state;
    }

    getCode(): string {
        return this.code;
    }

    reset() {
        this.state = null;
        this.code = null;
    }
}
