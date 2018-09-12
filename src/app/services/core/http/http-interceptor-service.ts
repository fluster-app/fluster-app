// https://www.illucit.com/blog/2016/03/angular2-http-authentication-interceptor/
// http://stackoverflow.com/questions/35498456/what-is-httpinterceptor-equivalent-in-angular2

// Angular 4 https://netbasal.com/a-taste-from-the-new-angular-http-client-38fcdc6b359b
// but replace .map with .do
// https://stackoverflow.com/a/45367608/5404186

import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';

import {Observable, throwError, EMPTY} from 'rxjs';
import {tap, catchError} from 'rxjs/operators';

import {InterceptorRedirectService} from './interceptor-redirect-service';

@Injectable({
    providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {

    constructor(private interceptorRedirectService: InterceptorRedirectService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(req).pipe(
            tap((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    // do stuff with response if you want
                }
            }),
            catchError((err: HttpErrorResponse) => {
                if ((err.status === 400) || (err.status === 401)) {
                    this.interceptorRedirectService.getInterceptedSource().next(err.status);
                    return EMPTY;
                } else {
                    return throwError(err);
                }
            })
        );
    }
}
