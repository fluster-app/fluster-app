import {PreloadingStrategy, Route} from '@angular/router';

import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';

export interface RouteToPreload {
    routePath: string;
    route: Route;
    load: Function;
}

@Injectable({
    providedIn: 'root'
})
export class AppRoutingPreloaderService implements PreloadingStrategy {

    private routesToPreload: RouteToPreload[] = [];

    constructor() {
    }

    preload(route: Route, load: Function): Observable<any> {
        if (route.data && route.data.preload) {
            this.routesToPreload.push({
                routePath: route.path,
                route: route,
                load: load
            });
        }

        return of(null);
    }

    preloadRoute(path: string): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this.routesToPreload && this.routesToPreload.length > 0) {
                const routeToPreload: RouteToPreload = this.routesToPreload.find((filterRouteToPreload: RouteToPreload) => filterRouteToPreload.routePath === path);

                if (routeToPreload) {
                    routeToPreload.load();
                }
            }

            resolve();
        });
    }
}
