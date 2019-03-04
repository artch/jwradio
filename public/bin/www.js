var express  = require('express'),
    serveStatic = require('serve-static'),
    methodOverride = require('method-override'),
    bodyParser = require('body-parser'),
    path = require('path');

var app      = express();

app.use(serveStatic(path.resolve(__dirname, '../src')));
//app.use(express.logger('dev'));
app.use(bodyParser());
app.use(methodOverride());

var port = process.env.PORT || 8097;
app.listen(port);
console.log("App listening on port "+port);