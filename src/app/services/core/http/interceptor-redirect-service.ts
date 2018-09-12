import {Injectable} from '@angular/core';

import {Observable, Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InterceptorRedirectService {

    private requestInterceptedSource: Subject<number> = new Subject<number>();
    requestIntercepted: Observable<number> = this.requestInterceptedSource.asObservable();

    constructor() {
    }

    getInterceptedSource(): Subject<number> {
        return this.requestInterceptedSource;
    }

}
