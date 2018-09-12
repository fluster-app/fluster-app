var ncp = require('ncp').ncp;

var SRC_DIR = 'resources/android/icon_notification/';
var DEST_DIR = 'platforms/android/app/src/main/res/';

module.exports = function (context) {

    ncp(SRC_DIR, DEST_DIR, function (err) {
        if (err) {
            return console.error(err);
        } else {
            console.log('done!');
        }
    });

};
