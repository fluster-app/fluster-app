var replace = require('replace');
var fs = require('fs');

var replaceInJavaFiles = ['./plugins/cordova-plugin-x-socialsharing/src/android/nl/xservices/plugins/SocialSharing.java'];

module.exports = function (context) {

    if (fs.existsSync('./plugins/cordova-plugin-x-socialsharing/src/android/nl/xservices/plugins/SocialSharing.java')) {
        replace({
            regex: "Intent.FLAG_ACTIVITY_NEW_TASK",
            replacement: "Intent.FLAG_ACTIVITY_SINGLE_TOP",
            paths: replaceInJavaFiles,
            recursive: false,
            silent: false
        });
    }

};
