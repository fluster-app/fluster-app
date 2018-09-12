var replace = require('replace');
var fs = require('fs');

var replaceInFiles = ['./plugins/cordova-plugin-splashscreen/src/ios/CDVSplashScreen.m'];

module.exports = function (context) {

    if (fs.existsSync('./plugins/cordova-plugin-splashscreen/src/ios/CDVSplashScreen.m')) {
        replace({
            regex: "parentView.bounds.size.height / 2",
            replacement: "parentView.bounds.size.height / 1.35",
            paths: replaceInFiles,
            recursive: false,
            silent: false
        });
    }

};
