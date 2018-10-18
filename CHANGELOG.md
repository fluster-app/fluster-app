<a name="5.1.3"></a>
# [5.1.3](https://github.com/fluster/fluster-app/compare/v5.1.2...v5.1.3) (2018-10-18)

### UX

* improve menu wording ([#44](https://github.com/fluster/fluster-app/issues/44))
* improve first choice page ([#43](https://github.com/fluster/fluster-app/issues/43))

### Fixes

* read correctly the value of picked birthday ([#42](https://github.com/fluster/fluster-app/issues/42))

<a name="5.1.2"></a>
# [5.1.2](https://github.com/fluster/fluster-app/compare/v5.1.1...v5.1.2) (2018-10-12)

### UX

* add a parallax effect on the navigation bar on Android too ([#40](https://github.com/fluster/fluster-app/issues/40))
* favorite artists' name were shrinked, display them properly ([#37](https://github.com/fluster/fluster-app/issues/37))

### Fixes

* some styles were not properly applied in Firefox ([#41](https://github.com/fluster/fluster-app/issues/41))

<a name="5.1.1"></a>
# [5.1.1](https://github.com/fluster/fluster-app/compare/v5.1.0...v5.1.1) (2018-10-10)

### UX

* don't display action sheet to select who could view a flatshare or flat if there isn't an ad yet ([#38](https://github.com/fluster/fluster-app/issues/38))

<a name="5.1.0"></a>
# [5.1.0](https://github.com/fluster/fluster-app/compare/v5.0.1...v5.1.0) (2018-10-09)

### Features

* on the page where users could select who could see theirs ads, add the information about how many users could be reached ([#33](https://github.com/fluster/fluster-app/issues/33))
* when users would refresh their profile, refresh the details of their ads ([#23](https://github.com/fluster/fluster-app/issues/23))

### UX

* block double tap on sliders' images ([#35](https://github.com/fluster/fluster-app/issues/35))

### Fixes

* display of the photos were not updated after an ad would have been updated with the wizard ([#32](https://github.com/fluster/fluster-app/issues/32))
* square meters weren't displaying when editing an ad with the wizard ([#36](https://github.com/fluster/fluster-app/issues/36))

<a name="5.0.1"></a>
# [5.0.1](https://github.com/fluster/fluster-app/compare/v5.0.0...v5.0.1) (2018-10-02)

### Fixes for Android and PWA

* loading not dismissed if user go back and forth to first-choice page ([#29](https://github.com/fluster/fluster-app/issues/29))
* hardware back button support improved for the wizard and modals ([#28](https://github.com/fluster/fluster-app/issues/28) and [#30](https://github.com/fluster/fluster-app/issues/30)) 

<a name="5.0.0"></a>
# [5.0.0](https://github.com/fluster/fluster-app/releases/tag/v5.0.0) (2018-09-28)

Hooray, here is Fluster v5 🎉 

### Features

* You could now send requests without any viewing dates or timeframes
* If you do select timeframes, Fluster will assist you better by prefilling your availabilities, letting you spare even more time in the communication process
* The wizard to publish your flatshares is now shorter and therefore faster
* The integration of the photo filters is more user friendly
* Some interactions have been improved to make the overall experience friendlier

### Tech

* Fluster is now powered by Ionic v4 and Angular v6 which has for effect that the app is smoooooooooother

Hope you will enjoy this version, let me know if you face any issues or have improvements ideas 😃🤘

David

<a name="5.0.0-rc.0"></a>
# [5.0.0-rc.0](https://github.com/fluster/fluster-app/compare/v5.0.0-beta.7...v5.0.0-rc.0) (2018-09-27)

### UX

* add ripple effect to date picker ([#14](https://github.com/fluster/fluster-app/issues/14))
* on Android, don't apply the parallax effect on item details ([#1](https://github.com/fluster/fluster-app/issues/1))

### Fixes

* better handle some uncatched promises return ([#19](https://github.com/fluster/fluster-app/issues/19))

<a name="5.0.0-beta.7"></a>
# [5.0.0-beta.7](https://github.com/fluster/fluster-app/compare/v5.0.0-beta.6...v5.0.0-beta.7) (2018-09-26)

### UX

* miscellaneous improvements regarding design after a run of tests on (real) iOS and Android
* revert/remove the buttons on date picker and go back to tappable items ([#2](https://github.com/fluster/fluster-app/issues/2))

### Fixes

* search location of interests weren't displayed on iOS (only) ([#17](https://github.com/fluster/fluster-app/issues/17))
* the very first time a bookmark was set, it used to took a bit more time ([#15](https://github.com/fluster/fluster-app/issues/15))
* after the first week, the calendar directive didn't displayed the time of the appointments ([#13](https://github.com/fluster/fluster-app/issues/13))

<a name="5.0.0-beta.6"></a>
# [5.0.0-beta.6](https://github.com/fluster/fluster-app/releases/tag/v5.0.0-beta.6) (2018-09-23)

### Features

* help users by prefilling automatically their schedule when requesting viewings ([#12](https://github.com/fluster/fluster-app/issues/12))
* make viewings requests more flexible, allow requests without schedule ([#2](https://github.com/fluster/fluster-app/issues/2))
* remove step appointments from wizard ([#6](https://github.com/fluster/fluster-app/issues/6))

### UX

* reduce the size of the biggest font size ([#11](https://github.com/fluster/fluster-app/issues/11))
* when navigating side browse -> publish, don't navigate automaticall to wizard ([#10](https://github.com/fluster/fluster-app/issues/10))
* improve screenshots quality on login page ([#8](https://github.com/fluster/fluster-app/issues/8))
* status bar color on iOS ([#4](https://github.com/fluster/fluster-app/issues/4))
* highlight terms and conditions on login page ([#7](https://github.com/fluster/fluster-app/issues/7))
