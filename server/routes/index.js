var https = require('https');
var $ = require('jquery');
var xml2js = require('xml2js');
var template = require('url-template');

var options = {
    host: 'mingle.corp.wikimedia.org',
    path: template.parse('/api/v2/projects/{project}/cards/{cardId}.xml')
};

/*
 * GET home page.
 */
exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};


/*
 * GET table with user acceptance criteria from mingle
 * /card/:project/:cardId(\\d+)/list/criteria$
 */
exports.cardListCriteria = function(req, res) {
    getMingleCard(req.params, function(mingleCard){
        res.send(mingleCard.acceptanceCriteriaTable);
    });
};

/*
 * GET table with user acceptance criteria from mingle
 * /card/:project/:cardId(\\d+)/add/criteria$
 */
exports.cardAddCriteria = function(req, res) {
    getMingleCard(req.params, function(mingleCard){
	console.log(req.body.link);
	var $table = $(mingleCard.acceptanceCriteriaTable);
	var rowCount = $table.children('tr').length;
	var row = $table.children('tr:nth-child(2)');
	$(row.children('td')).each(function(index, elem) {
		console.log(index, $(elem).html());
		var $cell = $(this);
		$cell.empty();
		switch(index) {
			case 0:
				$cell.html(rowCount);
			case 1: //Given
				$cell.html(req.body.given);
			case 2: //When
				$cell.html(req.body.when);
			case 3: //Then
				$cell.html(req.body.then);
		}
	});
	$table.append(row);
        res.send($table.html());
    });
};

/*
 * GET table with user acceptance criteria from mingle
 * /card/:project/:cardId(\\d+)/add/commit$
 */
exports.cardAddCommit = function(req, res) {
    getMingleCard(req.params, function(mingleCard){
        res.send('Not Implemented');
    });
};

/*
 * GET table with user acceptance criteria from mingle
 * /card/:project/:cardId(\\d+)/finish/criteria$
 */
exports.cardFinishCriteria = function(req, res) {
    getMingleCard(req.params, function(mingleCard){
        res.send('Not Implemented');
    });
};


function getMingleCard(params, callback) {
    var mingleRequest = $.extend({}, options, {
        path: options.path.expand(params)
    });
    
    var xml = '';
    var get = https.get(mingleRequest, function(res2) {
        res2.setEncoding('utf8');
        res2.on('data', function(chunk) {
            xml += chunk;
        }).on('error', function(e) {
            console.log('ERROR: ' + e.message);
        }).on('end', function(){
            xml2js.parseString(xml, function(errXML, result){
                var result = result.card.description[0];
                var mingleCard = $.extend({}, result.card, {
                    acceptanceCriteriaTable: parseMingleTable(result)
                });
                callback.call(callback, mingleCard);
            });
        });
    });
}

function parseMingleTable(mingleCardDescription) {
    
    var bodyArray = $(mingleCardDescription);
    var table = findAcceptanceCriteriaTable(bodyArray);
    return $(table).html();
}

function findAcceptanceCriteriaTable(bodyArray){
    var acceptanceH1 = -1;
    for (i in bodyArray){
        if (acceptanceH1 === -1 && $(bodyArray[i]).is('h1:contains("Acceptance Criteria")')){
            acceptanceH1 = i;
        } else if (acceptanceH1 !== -1) {
            if ($(bodyArray[i]).is('table')){ console.log('found at ' + i + ' of ' + bodyArray.length); return bodyArray[i]; }
            else if ($(bodyArray[i]).is('h1')) { console.log('not found'); break; }
        }
    }
    console.log('not found');
    return '';
}
