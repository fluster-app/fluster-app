import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Camera} from '@ionic-native/camera/ngx';
import {Facebook} from '@ionic-native/facebook/ngx';
import {File} from '@ionic-native/file/ngx';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {Push} from '@ionic-native/push/ngx';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';
import {Device} from '@ionic-native/device/ngx';
import {GoogleAnalytics} from '@ionic-native/google-analytics/ngx';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {WebView} from '@ionic-native/ionic-webview/ngx';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';

import {HttpInterceptorService} from './services/core/http/http-interceptor-service';
import {SentryErrorHandler} from './services/core/error/sentry-error-handler';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {IonicStorageModule} from '@ionic/storage';
import {IonicGestureConfig} from './services/core/gesture/ionic-gesture-config';

import {MenuHeaderModule} from './components/core/menu-header/menu-header.module';
import {MenuFooterModule} from './components/core/menu-footer/menu-footer.module';
import {NavbarNotificationModule} from './components/core/notification/navbar-notification/navbar-notification.module';

import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';

export function exportTranslateStaticLoader(httpClient: HttpClient) {
    return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot({
            scrollAssist: false,
            swipeBackEnabled: false,
            menuType: 'overlay',
            backButtonText: ''
        }),
        AppRoutingModule,
        TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useFactory: exportTranslateStaticLoader,
                    deps: [HttpClient]
                }
            }
        ),
        IonicStorageModule.forRoot(),

        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.serviceWorker}),

        // Fluster modules
        MenuHeaderModule,
        MenuFooterModule,
        NavbarNotificationModule
    ],
    exports: [
        TranslateModule
    ],
    providers: [
        // Native
        StatusBar,
        SplashScreen,
        Camera,
        Facebook,
        File,
        InAppBrowser,
        Push,
        SocialSharing,
        Device,
        GoogleAnalytics,
        GooglePlus,
        WebView,

        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},

        {provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true},
        {provide: ErrorHandler, useClass: SentryErrorHandler},
        {provide: HAMMER_GESTURE_CONFIG, useClass: IonicGestureConfig}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
