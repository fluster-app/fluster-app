var ncp = require('ncp').ncp;

var SRC_FILE = 'resources/android/google-services.json';
var DEST_FILE = 'platforms/android/app/google-services.json';

var SRC_SIGNING_FILE = 'resources/android/release-signing.properties';
var DEST_SIGNING_FILE = 'platforms/android/release-signing.properties';

module.exports = function (context) {

    ncp(SRC_FILE, DEST_FILE, function (err) {
        if (err) {
            return console.error(err);
        } else {
            console.log('done!');
        }
    });

    ncp(SRC_SIGNING_FILE, DEST_SIGNING_FILE, function (err) {
        if (err) {
            return console.error(err);
        } else {
            console.log('done!');
        }
    });

};
