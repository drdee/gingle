require('longjohn'); // for long stack traces
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
        res.send(mingleCard.acceptanceCriteria);
    });
};

/*
 * GET table with user acceptance criteria from mingle
 * /card/:project/:cardId(\\d+)/add/criteria$
 */
exports.cardAddCriteria = function(req, res) {
    getMingleCard(req.params, function(mingleCard){
        var table = $(mingleCard.acceptanceCriteriaTable);
        var newRow = $('tr');
        newRow.append('td').text(mingleCard.acceptanceCriteria.length);
        newRow.append('td').text(req.body.given);
        newRow.append('td').text(req.body.when);
        newRow.append('td').text(req.body.then);
        newRow.append('td');
        newRow.append('td');
        table.append(newRow);
        res.send(getOuterHtml(table));
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
                var mingleCard = $.extend(
                    {},
                    result.card,
                    getAcceptanceCriteriaTable(result.card.description[0])
                );
                callback.call(callback, mingleCard);
            });
        });
    });
}

function getAcceptanceCriteriaTable(mingleCardDescription) {
    
    // find the table
    var titleFound = false;
    var table = null;
    $(mingleCardDescription).each(function(i){
        if (titleFound) {
            if ($(this).is('table')) {
                table = this;
                return false;
            } else if ($(this).is('h1')) {
                console.log('not found');
                return false;
            }
        }
        if (!titleFound && $(this).is('h1:contains("Acceptance Criteria")')){
            titleFound = true;
        }
    });
    
    // parse the table into an array of objects
    var acceptanceCriteria = [];
    $('tr', $(table)).each(function(i){
        acceptanceCriteria[i] = {};
        
        if (i === 0){
            $('th', $(this)).map(function(j, heading){
                acceptanceCriteria[i][j] = $(heading).text();
            });
        } else {
            $('td', $(this)).map(function(j, criteriaPiece){
                acceptanceCriteria[i][acceptanceCriteria[0][j]] = $(criteriaPiece).text();
            });
        }
    });
    console.log(acceptanceCriteria);
    
    // return both results from above
    return {
        acceptanceCriteriaTable: getOuterHtml(table),
        acceptanceCriteria: acceptanceCriteria
    };
}

function getOuterHtml(element){
    return $(element).wrap('<div>').parent().html();
}
