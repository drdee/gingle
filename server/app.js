
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);


// get table with user acceptance criteria from mingle
app.get('/card/:project/:cardId(\\d+)/list/criteria$', routes.cardListCriteria);
app.post('/card/:project/:cardId(\\d+)/add/criteria$', routes.cardAddCriteria);
app.post('/card/:project/:cardId(\\d+)/add/commit$', routes.cardAddCommit);
app.post('/card/:project/:cardId(\\d+)/finish/criteria$', routes.cardFinishCriteria);

console.log(app.routes)

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
