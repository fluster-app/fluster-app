<h1 align="center">Fluster</h1>

<p align="center">
  Roommates next door
</p>

<p align="center">
  <a href="https://fluster.io/">
    <img alt="Fluster" title="Fluster" src="https://github.com/fluster/fluster-app/blob/master/resources/pwa/assets/icon/android-chrome-512x512.png" width="450">
  </a>
</p>

<p align="center">
  <a href="https://itunes.apple.com/app/id1187266720">
    <img alt="Download on the App Store" title="App Store" src="https://fluster.io/assets/images/store/app-store-badge-en.svg" height="48px">
  </a>

  <a href="http://play.google.com/store/apps/details?id=io.fluster.fluster">
    <img alt="Get it on Google Play" title="Google Play" src="https://fluster.io/assets/images/store/google-play-badge-en.png" height="48px">
  </a>

  <a href="https://m.fluster.io">
    <img alt="Launch now as a PWA" title="PWA" src="https://user-images.githubusercontent.com/9122190/28998409-c5bf7362-7a00-11e7-9b63-db56694522e7.png" height="48px">
  </a>
</p>

## Introduction

Fluster is a platform which aims to simplify the search for roommates and flatshares by using smart features 😃🎉

Fluster is a mobile application and a progressive web app build with [Ionic](https://ionicframework.com), [Angular](http://angular.io) and [Cordova](https://cordova.apache.org).

### Features

A few of the things Fluster offers:

* Fluster recommends you flatshares fitting your needs
* With Fluster, you could discover what are the lifestyle and hobbies of your future roommates
* You like a place on Fluster? You could send instant viewing requests
* Fluster take care of the calendar of your viewings
* Fluster is free, open source and even publishing an ad about your room to let is free too

### Third party services

Fluster use the following third party services:

* Branch
* Facebook
* Google Plus
* Google Analytics, Geolocation and Places
* Sentry
* Spotify
* Yelp

### Plugins and components spotlight

Beside the above mentioned stack, several awesome components and plugins are used in the Fluster mobile app. Thank to them, Fluster could offers several useful features:

* A couple of Cordova plugins from [Eddy Verbruggen](https://github.com/EddyVerbruggen)
* [cropperjs](https://github.com/fengyuanchen/cropperjs) from [Fengyuan Chen](https://github.com/fengyuanchen)
* [momentjs](https://momentjs.com)
* [ngx-translate](http://www.ngx-translate.com) from [ocombe](https://github.com/ocombe)
* The [facebook4](https://github.com/jeduan/cordova-plugin-facebook4) plugin of [Jeduan Cornejo](https://github.com/jeduan)
* The [push](https://github.com/phonegap/phonegap-plugin-push) plugin of [Simon MacDonald](https://github.com/macdonst)
* [underscore](https://github.com/jashkenas/underscore)

Furthermore, this mobile app use also some other libraries I did publish as separate components:

* [ionic-swing](https://github.com/fluster/ionic-swing) use for the swipeable cards feature
* [web-photo-filer](https://github.com/fluster/web-photo-filter) a web component to apply Instagram-like WebGL filters to photos
* [web-social-share](https://github.com/fluster/web-social-share) a web component to share urls and content on social networks (use in the PWA version of the app)

These last two web components are build using [Stencil](https://stenciljs.com).

**Available for iOS and Android, mobiles or tablets, as a PWA and on the web.**

<div align="center">
  <img src="https://github.com/fluster/fluster-app/blob/master/src/assets/img/login/login-slide1.png" width="250px">
</div>

## Getting Started

Once you have cloned this repository and if you are looking to serve or build the application, you will have first to define your own third party keys in `resources.ts`.

The Fluster app is both a mobile app and a PWA. Handling these different targets is possible with the help of the Angular CLI. However some files, like `index.html`, aren't dynamic and therefore need to be modified before serve or build with the help of Gulp commands. 

### Debug locally

Serve the PWA connected with the staging server:

```bash
gulp proxy
ionic serve
```

### Build mobile app

Build the iOS mobile Cordova app platform for the staging server:

```bash
gulp rmmockup
gulp staging
gulp cordova
ionic cordova build ios --prod -c staging
```

### Build PWA

Build the PWA platform for the staging server:

```bash
npm run pwa-staging
```

## Feedback

Feel free to send me feedback on [Twitter](https://twitter.com/daviddalbusco) or [file an issue](https://github.com/fluster/fluster-appx/issues/new). Feature requests are always welcome.

## Social

Follow Fluster on [Twitter](https://twitter.com/flusterapp) or [Instagram](http://instagram.com/fluster.io/).

## License

Fluster is released under the GNU Affero General Public License. Copyright Fluster GmbH, Zürich, Switzerland. See COPYING for more details.

Fluster is developed by David Dal Busco.

The Fluster logo and some icons (ico_man.svg and ico_woman.svg) are a registered trademark of David Dal Busco, Zürich, Switzerland. Please contact [me](mailto:david@fluster.io) if you want to use the logo or these specific icons.
