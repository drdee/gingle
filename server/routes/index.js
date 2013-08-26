var https = require('https');
var $ = require('jquery');
var xml2js = require('xml2js');

var options = {
    host: 'mingle.corp.wikimedia.org',
    path: '/api/v2/projects/analytics/cards/'
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
    opts = $.extend(options, {
        path: options['path'] + req.params.feature_id + '.xml'
    });
    
    var response = '';
    var get = https.get(opts, function(res2) {
        console.log('STATUS: ' + res2.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res2.headers));
        res2.setEncoding('utf8');
        res2.on('data', function(chunk) {
            response += chunk;
        }).on('error', function(e) {
            console.log('ERROR: ' + e.message);
        }).on('end', function(){
            
            response = xml2js.parseString(response, function(errXML, result){
                var result = result.card.description[0];
                var acceptanceCriteriaTable = parseMingleTable(result);
                res.send(acceptanceCriteriaTable);
            });
        });
    });
};

function parseMingleTable(response) {
    
    var bodyArray = $(response);
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

// NOTE: example for reference: '<body><h1>Background</h1> <ul> <li>For privacy reasons, individual results should not be available to certain user roles.</li> </ul> <p>&nbsp;</p> <h1>User Stories</h1> <table> <tbody> <tr> <th>#</th> <th>As a</th> <th>I want to</th> <th>So that I can</th> </tr> <tr> <td>1</td> <td>User</td> <td>add aggregations to a new report</td> <td>analyze cohort-level statistics</td> </tr> <tr> <td>2</td> <td>&nbsp;</td> <td>&nbsp;</td> <td>&nbsp;</td> </tr> </tbody> </table> <h1>Acceptance Criteria</h1> <table style="color: rgb(0, 0, 0); font-family: Arial, Helvetica;"> <tbody> <tr> <th>#</th> <th>Given</th> <th>When</th> <th>Then</th> <th>Approved</th> <th>Comment</th> </tr> <tr> <td>1</td> <td>I am creating a new report</td> <td>I select a Metric in the Aggregate section<br> And I select the Sum Aggregate<br> And I run the report</td> <td>The report will show the Sum of my Metric for the Cohorts I selected&nbsp;</td> <td>&nbsp;</td> <td>&nbsp;</td> </tr> <tr> <td>2</td> <td><span style="font-family: Arial, Helvetica;">I am creating a new report</span></td> <td><span style="font-family: Arial, Helvetica;">I select a Metric in the Aggregate section</span><br style="font-family: Arial, Helvetica;"> <span style="font-family: Arial, Helvetica;">And I select the Average Aggregate</span><br style="font-family: Arial, Helvetica;"> <span style="font-family: Arial, Helvetica;">And I run the report</span></td> <td><span style="font-family:  Arial, Helvetica;">The report will show the Average of my Metric for the Cohorts I selected</span></td> <td>&nbsp;</td> <td>&nbsp;<br> &nbsp;</td> </tr> <tr> <td>3</td> <td><span style="font-family:  Arial, Helvetica;">I am creating a new report</span></td> <td><span style="font-family:  Arial, Helvetica;">I select a Metric in the Aggregate section</span><br style="font-family:  Arial, Helvetica;"> <span style="font-family:  Arial, Helvetica;">And I select the Standard Deviation Aggregate</span><br style="font-family:  Arial, Helvetica;"> <span style="font-family:  Arial, Helvetica;">And I run the report</span></td> <td>The report will show the Standard Deviation of my Metric for the Cohorts I selected</td> <td>&nbsp;</td> <td>&nbsp;</td> </tr> </tbody> </table> <h2>&nbsp;</h2> <h1>Implementation Details</h1> <h2>In Scope</h2> <ul style="line-height: 19px; color: rgb(0, 0, 0); font-family:  Arial, Helvetica; font-size: 14px;"> <li>An AggregateReport that can be added to a ReportNode/Report tree.</li> <li>A simple UI section below "Pick Metrics" that allows the user to pick Aggregates at the metric level, for all selected Cohorts.</li> <li>Sum, average, and standard deviation aggregators.</li> <li>An option to show or hide the Individual Results for that Metric in the report. &nbsp;This will eventually be disabled for non-Admins.</li> </ul> <h2>Out of Scope</h2> <ul style="line-height: 19px; color: rgb(0, 0, 0); font-family:  Arial, Helvetica; font-size: 14px;"> <li>&nbsp;</li> </ul> <h1>References</h1> <ul> <li> <p>&nbsp;</p> </li> </ul> <p>&nbsp;</p> <h1><span style="color: rgb(17, 17, 17); font-size: 18px; font-weight: 700;">REMEMBER a story card is:</span></h1> <ul> <li>Readable</li> <li>Testable</li> <li>Implementation Agnostic</li> <li>Actionable when statements</li> <li>Strong verb usage</li> <li>Tells a story</li> </ul></body>'
