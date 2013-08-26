var https = require('https');
var $ = require('jquery');

var options = {
    host: 'mingle.corp.wikimedia.org',
    path: '/projects/analytics/cards/'
};

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};


/*
 * GET table with user acceptance criteria from mingle
 */

exports.feature_list = function(req, res) {
    options['path'] = options['path'] + req.params.feature_id;
    console.log(options);
    var response = '';
    var get = https.get(options, function(res2) {
        console.log('STATUS: ' + res2.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res2.headers));
        res2.setEncoding('utf8');
        res2.on('data', function(chunk) {
            response += chunk;
        }).on('error', function(e) {
            console.log('ERROR: ' + e.message);
        }).on('end', function(){
            parse_mingle_table(response);
            //console.log(response);
            //res.send('Feature ' + req.params.feature_id + ' requested<br>' + response);
        });
    });
};

function parse_mingle_table(response) {
    var $mingle = $("#mingle")
    var html = $.parseHTML(response);
    $mingle.append(html);
    $('#mingle table').each(function() {
        console.log($(this).find("th:first").html());
    });
}
