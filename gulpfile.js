const gulp = require('gulp');

const replace = require('replace');
const removeCode = require('gulp-remove-code');

const del = require('del');

const fs = require('fs');

// Copy Cordova APK to OneDrive

gulp.task('copy-apk', function () {
    gulp.src('./platforms/android/app/build/outputs/apk/debug/*-debug.apk')
        .pipe(gulp.dest('/Users/daviddalbusco/Documents/OneDrive/apk'));

    gulp.src('./platforms/android/app/build/outputs/apk/release/*-release.apk')
        .pipe(gulp.dest('/Users/daviddalbusco/Documents/OneDrive/apk'));
});

// Enable proxy in index.html

const replaceFiles = ['./src/index.html'];

gulp.task('proxy', function () {

    replace({
        regex: "script-src 'unsafe-eval' 'self'",
        replacement: "script-src 'unsafe-eval' 'self' http://localhost:35729",
        paths: replaceFiles,
        recursive: false,
        silent: false
    });

    replace({
        regex: "connect-src 'self'",
        replacement: "connect-src 'self' ws://localhost:35729",
        paths: replaceFiles,
        recursive: false,
        silent: false
    });

    replace({
        regex: "https://api.fluster.io",
        replacement: "http://localhost:8100",
        paths: replaceFiles,
        recursive: false,
        silent: false
    });
});

gulp.task('revert-proxy', function () {

    replace({
        regex: "script-src 'unsafe-eval' 'self' http://localhost:35729",
        replacement: "script-src 'unsafe-eval' 'self'",
        paths: replaceFiles,
        recursive: false,
        silent: false
    });

    replace({
        regex: "connect-src 'self' ws://localhost:35729",
        replacement: "connect-src 'self'",
        paths: replaceFiles,
        recursive: false,
        silent: false
    });

    replace({
        regex: "http://localhost:8100",
        replacement: "https://api.fluster.io",
        paths: replaceFiles,
        recursive: false,
        silent: false
    });
});

// Switch local, staging and prod for Cordova build

const replaceFilesTargetServer = ['./config.xml', './src/index.html'];

gulp.task('local', function () {

    replace({
        regex: "https://api.fluster.io",
        replacement: "http://localhost:3000",
        paths: replaceFilesTargetServer,
        recursive: false,
        silent: false
    });

    replace({
        regex: "api.fluster.io",
        replacement: "localhost:3000",
        paths: replaceFilesTargetServer,
        recursive: false,
        silent: false
    });
});

gulp.task('revert-local', function () {

    replace({
        regex: "http://localhost:3000",
        replacement: "https://api.fluster.io",
        paths: replaceFilesTargetServer,
        recursive: false,
        silent: false
    });

    replace({
        regex: "localhost:3000",
        replacement: "api.fluster.io",
        paths: replaceFilesTargetServer,
        recursive: false,
        silent: false
    });
});

gulp.task('staging', function () {

    replace({
        regex: "fluster.io",
        replacement: "peterparker.tech",
        paths: replaceFilesTargetServer,
        recursive: false,
        silent: false
    });
});

gulp.task('revert-staging', function () {

    replace({
        regex: "peterparker.tech",
        replacement: "fluster.io",
        paths: replaceFilesTargetServer,
        recursive: false,
        silent: false
    });
});

// Inject secret keys

const replaceResources = ['./src/app/services/core/utils/resources.ts', './config.xml', './package.json', './build.json'];
const replaceLoginMockup = ['./src/app/pages/core/login/login.page.ts'];

gulp.task('resources', function () {
    const resources = JSON.parse(fs.readFileSync('/Users/daviddalbusco/Documents/projects/reedrichards/resources/resources.json'));

    replace({
        regex: "{{AUTH_KEY}}",
        replacement: resources.AUTH_KEY,
        paths: replaceResources,
        recursive: false,
        silent: false
    });

    replace({
        regex: "{{FACEBOOK_APP_ID}}",
        replacement: resources.FACEBOOK.APP_ID,
        paths: replaceResources,
        recursive: false,
        silent: false
    });

    replace({
        regex: "{{GOOGLE_API_KEY}}",
        replacement: resources.GOOGLE.API.KEY,
        paths: replaceResources,
        recursive: false,
        silent: false
    });

    replace({
        regex: "{{GOOGLE_LOGIN_WEB_CLIENT_ID}}",
        replacement: resources.GOOGLE.LOGIN.WEB_CLIENT_ID,
        paths: replaceResources,
        recursive: false,
        silent: false
    });

    replace({
        regex: "{{GOOGLE_LOGIN_REVERSED_CLIENT_ID}}",
        replacement: resources.GOOGLE.LOGIN.REVERSED_CLIENT_ID,
        paths: replaceResources,
        recursive: false,
        silent: false
    });

    replace({
        regex: "{{GOOGLE_ANALYTICS_TRACKER_ID}}",
        replacement: resources.GOOGLE.ANALYTICS.TRACKER_ID,
        paths: replaceResources,
        recursive: false,
        silent: false
    });

    replace({
        regex: "{{GOOGLE_PROJECT_NUMBER}}",
        replacement: resources.GOOGLE.PROJECT.NUMBER,
        paths: replaceResources,
        recursive: false,
        silent: false
    });

    replace({
        regex: "{{SENTRY_DSN}}",
        replacement: resources.SENTRY.DSN,
        paths: replaceResources,
        recursive: false,
        silent: false
    });

    replace({
        regex: "{{SPOTIFY_CLIENT_ID}}",
        replacement: resources.SPOTIFY.CLIENT_ID,
        paths: replaceResources,
        recursive: false,
        silent: false
    });

    replace({
        regex: "{{BRANCH_KEY}}",
        replacement: resources.BRANCH.KEY,
        paths: replaceResources,
        recursive: false,
        silent: false
    });

    replace({
        regex: "{{IOS_TEAM_RELEASE}}",
        replacement: resources.IOS.TEAM_RELEASE,
        paths: replaceResources,
        recursive: false,
        silent: false
    });

    replace({
        regex: "{{MOCKUP_LOGIN_TOKEN_DAVID}}",
        replacement: resources.MOCKUP.LOGIN_TOKEN.DAVID,
        paths: replaceLoginMockup,
        recursive: false,
        silent: false
    });

    replace({
        regex: "{{MOCKUP_LOGIN_TOKEN_SAM}}",
        replacement: resources.MOCKUP.LOGIN_TOKEN.SAM,
        paths: replaceLoginMockup,
        recursive: false,
        silent: false
    });

    replace({
        regex: "{{MOCKUP_LOGIN_TOKEN_STEVE}}",
        replacement: resources.MOCKUP.LOGIN_TOKEN.STEVE,
        paths: replaceLoginMockup,
        recursive: false,
        silent: false
    });

});

// Switch index.html to PWA or Cordova

gulp.task('pwa', function () {

    gulp.src('./src/index.html')
        .pipe(removeCode({ pwa: true }))
        .pipe(gulp.dest('./src/'));

});

gulp.task('cordova', function () {

    gulp.src('./src/index.html')
        .pipe(removeCode({ cordova: true }))
        .pipe(gulp.dest('./src/'));

    // Copy Cordova Android configuration
    gulp.src('/Users/daviddalbusco/Documents/projects/reedrichards/resources/android/google-services.json')
        .pipe(gulp.dest('./resources/android/'));

    gulp.src('/Users/daviddalbusco/Documents/projects/reedrichards/resources/android/release-signing.properties')
        .pipe(gulp.dest('./resources/android/'));

    // Copy Cordova iOS configuration
    gulp.src('/Users/daviddalbusco/Documents/projects/reedrichards/resources/ios/GoogleService-Info.plist')
        .pipe(gulp.dest('./resources/ios/'));

});

// Remove mockup code

gulp.task('rmmockup', function () {

    // Login and logout

    gulp.src('./src/app/pages/core/login/login.page.ts')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/pages/core/login/'));

    gulp.src('./src/app/pages/core/login/login.page.html')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/pages/core/login/'));

    gulp.src('./src/app/pages/core/app-params/app-params.page.html')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/pages/core/app-params/'));

    // Photo mockup

    gulp.src('./src/app/modals/core/photo-picker/photo-picker.ts')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/modals/core/photo-picker/'));

    gulp.src('./src/app/modals/core/photo-picker/photo-picker.html')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/modals/core/photo-picker/'));

    gulp.src('./src/app/components/advertise/new-ad/new-ad-step-photo/new-ad-step-photo.ts')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/components/advertise/new-ad/new-ad-step-photo/'));

    gulp.src('./src/app/components/advertise/new-ad/new-ad-step-photo/new-ad-step-photo.html')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/components/advertise/new-ad/new-ad-step-photo/'));

    gulp.src('./src/app/services/advertise/new-item-service.ts')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/services/advertise/'));

    gulp.src('./src/app/services/core/amazon/s3-upload-service.ts')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/services/core/amazon/'));

    gulp.src('./src/app/components/items/item-slides/item-slides.ts')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/components/items/item-slides/'));

    gulp.src('./src/app/components/items/item-slides/item-slides.html')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/components/items/item-slides/'));

    // Develop

    gulp.src('./src/app/services/core/error/sentry-error-handler.ts')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/services/core/error/'));

    gulp.src('./src/app/services/native/analytics/google-analytics-native-service.ts')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/services/native/analytics/'));

    gulp.src('./src/app/pages/abstract-deep-linking-page-navigation.ts')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('./src/app/pages/'));
});

// Moment workaround to avoid to load all locales with Angular v6 https://github.com/moment/moment/issues/2517 and https://github.com/moment/moment/issues/2373

gulp.task('moment', function (cg) {
    del(['./node_modules/moment/locale/*', '!./node_modules/moment/locale/fr.js', '!./node_modules/moment/locale/de.js', '!./node_modules/moment/locale/it.js', '!./node_modules/moment/locale/en.js']);
});