var ncp = require('ncp').ncp;

var fs    = require('fs');     // nodejs.org/api/fs.html
var plist = require('plist');  // www.npmjs.com/package/plist

var FILEPATH = 'platforms/ios/Fluster/Fluster-Info.plist';

var SRC_FILE = 'resources/ios/GoogleService-Info.plist';
var DEST_FILE = 'platforms/ios/GoogleService-Info.plist';

module.exports = function (context) {

    var xml = fs.readFileSync(FILEPATH, 'utf8');
    var obj = plist.parse(xml);

    obj.ITSAppUsesNonExemptEncryption = false;

    obj.LSApplicationQueriesSchemes = [
        'fb',
        'instagram',
        'fbapi',
        'fb-messenger-api',
        'fbauth2',
        'fbshareextension'
    ];

    xml = plist.build(obj);
    fs.writeFileSync(FILEPATH, xml, { encoding: 'utf8' });

    ncp(SRC_FILE, DEST_FILE, function (err) {
        if (err) {
            return console.error(err);
        } else {
            console.log('done!');
        }
    });
};
