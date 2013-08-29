require('longjohn'); // for long stack traces
var querystring = require('querystring');
var https = require('https');
var $ = require('jquery');
var xml2js = require('xml2js');
var template = require('url-template');
var config = require('../config');

var options = {
    host: 'mingle.corp.wikimedia.org',
    auth: config.username + ':' + config.password,
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
    getMingleCard(res, req.params, function(mingleCard){
        res.send(mingleCard.acceptanceCriteria);
    });
};

/*
 * GET table with user acceptance criteria from mingle
 * /card/:project/:cardId(\\d+)/add/criteria$
 */
exports.cardAddCriteria = function(req, res) {
    getMingleCard(res, req.params, function(mingleCard){
        var i = mingleCard.acceptanceCriteria.push({
            "#": mingleCard.acceptanceCriteria.length,
            "Given": req.body.given,
            "When": req.body.when,
            "Then": req.body.then,
            "Approved": "",
            "Comment": ""
        });
        var saveData = makeDescriptionParameter(mingleCard);
        saveMingleCard(req.params, saveData, function(statusCode){
            var success = statusCode == 200;
            if (success) {
                res.send(
                    'New Criteria Created Successfully:\n' +
                    'Given ' + req.body.given +
                    ' When ' + req.body.when +
                    ' Then ' + req.body.then
                );
            } else {
                res.send('There was a problem.  Status Code: ' + statusCode);
            }
        })
    });
};

/*
 * GET table with user acceptance criteria from mingle
 * /card/:project/:cardId(\\d+)/add/commit$
 */
exports.cardAddCommit = function(req, res) {
    getMingleCard(res, req.params, function(mingleCard){
        addCommitToCriteria(mingleCard, req.body.task_id, req.body.link);
        var saveData = makeDescriptionParameter(mingleCard);
        saveMingleCard(req.params, saveData, function(statusCode){
            var success = statusCode == 200;
            if (success) {
                res.send(
                    'Added commit link: ' + req.body.link + '\n'
                );
            } else {
                res.send('There was a problem.  Status Code: ' + statusCode);
            }
        })
    });
};

/*
 * GET table with user acceptance criteria from mingle
 * /card/:project/:cardId(\\d+)/finish/criteria$
 */
exports.cardFinishCriteria = function(req, res) {
    getMingleCard(res, req.params, function(mingleCard){
        finishCriteria(mingleCard, req.body.task_id, req.body.link);
        var progress = measureCardProgress(mingleCard);
        var saveData = makeDescriptionParameter(mingleCard);
	saveData['card[properties][][name]'] = 'Progress';
        saveData['card[properties][][value]'] = progress; 
        saveMingleCard(req.params, saveData, function(statusCode){
            var success = statusCode == 200;
            if (success) {
                res.send(
                    'Finished: ' + req.body.task_id + '\n'
                );
            } else {
                res.send('There was a problem.  Status Code: ' + statusCode);
            }
        })
    });
};


function measureCardProgress(mingleCard) {
    var total_tasks = mingleCard.acceptanceCriteria.length - 1;
    var progress = 0.0;
    for (var task in mingleCard.acceptanceCriteria) {
        if (task['Comment'].indexOf('Done') > -1) {
        progress += 1.0;
        }
    }
    return progress / total_tasks;
}


function addCommitToCriteria(mingleCard, criteriaId, link){
    mingleCard.acceptanceCriteria[criteriaId]['Comment'] += getOuterHtml(
        $('<a></a>').attr('href', link).text(link)
    ) + ', ';
}


function finishCriteria(mingleCard, criteriaId, link){
    var comment = mingleCard.acceptanceCriteria[criteriaId]['Comment'];
    if (comment.toLowerCase().indexOf('(done)') < 0){
        mingleCard.acceptanceCriteria[criteriaId]['Comment'] = '(Done)&nbsp;&nbsp;' + comment;
    }
    addCommitToCriteria(mingleCard, criteriaId, link);
}


function getMingleCard(res, params, callback) {
    var mingleRequest = $.extend({}, options, {
        path: options.path.expand(params)
    });
    
    var xml = '';
    var get = https.get(mingleRequest, function(res2) {
        res2.setEncoding('utf8');
        res2.on('data', function(chunk) {
            xml += chunk;
        }).on('error', function(e) {
            console.error('ERROR: ' + e.message);
        }).on('end', function(res3){
            xml2js.parseString(xml, function(errXML, result){
                if (result && result.card) {
                    var mingleCard = $.extend(
                        {},
                        result.card,
                        getAcceptanceCriteriaTable(result.card.description[0])
                    );
                    callback.call(callback, mingleCard);
                } else {
                    res.send('Problem parsing or accessing Mingle (make sure config.json is set properly).');
                }
            });
        });
    });
    get.end();
}

function getAcceptanceCriteriaTable(mingleCardDescription) {
    
    // find the table
    var titleFound = false;
    var table = null;
    var tableIndex = -1;
    $(mingleCardDescription).each(function(i){
        if (titleFound) {
            if ($(this).is('table')) {
                table = this;
                tableIndex = i;
                return false;
            } else if ($(this).is('h1')) {
                console.warn('not found');
                return false;
            }
        }
        if (!titleFound && $(this).is('h1:contains("Acceptance Criteria")')){
            titleFound = true;
        }
    });
    
    // return both results from above
    return {
        acceptanceCriteriaTable: getOuterHtml(table),
        acceptanceCriteria: acceptanceCriteriaArrayFromTable(table),
        tableIndex: tableIndex
    };
}

// parse the table into an array of objects
function acceptanceCriteriaArrayFromTable(table){
    var acceptanceCriteria = [];
    $('tr', $(table)).each(function(i){
        acceptanceCriteria[i] = {};
        
        if (i === 0){
            $('th', $(this)).map(function(j, heading){
                acceptanceCriteria[i][j] = $(heading).text();
            });
        } else {
            $('td', $(this)).map(function(j, criteriaPiece){
                acceptanceCriteria[i][acceptanceCriteria[0][j]] = $(criteriaPiece).html();
            });
        }
    });
    return acceptanceCriteria;
}

// render an array of criteria as a table (with headers as the 0th row)
function acceptanceCriteriaTableFromArray(criteria){
    var table = $('<table><tbody></tbody></table>');
    if (criteria && criteria.length > 0) {
        var header = $('<tr></tr>');
        for (i in criteria[0]){
            header.append($('<th></th>').text(criteria[0][i]));
        }
        table.find('tbody').append(header);
    }
    if (criteria && criteria.length > 1) {
        for (var c = 1; c < criteria.length; c++){
            var row = $('<tr></tr>');
            for (i in criteria[0]){
                row.append($('<td></td>').html(criteria[c][criteria[0][i]]));
            }
            table.find('tbody').append(row);
        }
    }
    return table;
}

function getOuterHtml(element){
    return $(element).wrap('<div>').parent().html();
}

function makeDescriptionParameter(mingleCard){
    var table = acceptanceCriteriaTableFromArray(mingleCard.acceptanceCriteria);
    var description = $(mingleCard.description[0]);
    description[mingleCard.tableIndex] = $(getOuterHtml(table));
    var descriptionHtml = '';
    for (var i = 0; i < description.length; i++){
        descriptionHtml += getOuterHtml(description[i]);
    }
    return 'card[description]=' + encodeURIComponent(descriptionHtml);
}

function saveMingleCard(params, data, callback){
    var mingleRequest = $.extend({}, options, {
        path: options.path.expand({project: 'analytics', cardId: '1112'}),
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
    });
    
    var put = https.request(mingleRequest, function(res) {
        callback.call(callback, res.statusCode);
    });
    put.write(data);
    put.end();
}
