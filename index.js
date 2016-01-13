/**
 * Created by hocnguyen on 1/13/16.
 */
var ntlm = require('httpntlm').ntlm;
var async = require('async');
var httpreq = require('httpreq');
var HttpAgent = require('agentkeepalive');
var keepaliveAgent = new HttpAgent({keepAlive: true});
var fs = require('fs');

var options = {
    url: "https://someurl.com",
    username: 'nav1-advania@skaginn.local',
    password: 'Skaginn.300',
    workstation: 'choose.something',
    domain: ''
};

module.exports = {
    'request': function(opt,cb) {
        var fileData = fs.readFileSync(opt.filePath, 'utf8');
        options.url = opt.url;
        async.waterfall([
            function (callback) {
                var type1msg = ntlm.createType1Message(options);

                httpreq.post(options.url, {
                    headers: {
                        'Connection': 'keep-alive',
                        'Authorization': type1msg,
                        'Content-Type': 'text/xml;charset=UTF-8',
                        'SOAPAction': opt.SOAPAction
                    },
                    body: fileData,
                    agent: keepaliveAgent
                }, callback);
            },

            function (res, callback) {
                if (!res.headers['www-authenticate'])
                    return callback(new Error('www-authenticate not found on response of second request'));

                var type2msg = ntlm.parseType2Message(res.headers['www-authenticate']);
                var type3msg = ntlm.createType3Message(type2msg, options);

                httpreq.post(options.url, {
                    headers: {
                        'Connection': 'Close',
                        'Authorization': type3msg,
                        'Content-Type': 'text/xml;charset=UTF-8',
                        'SOAPAction': opt.SOAPAction
                    },
                    'body':fileData,
                    allowRedirects: false,
                    agent: keepaliveAgent
                }, callback);
            }
        ], function (err, res) {
            if (err) return console.log(err);

            console.log(res.headers);
            console.log(res.body);
            cb(err, res);
        });
    }

};
