#!/usr/bin/env nodejs

var fs = require('fs');
var express = require('express');
var util = require('util');
var path = require('path');
var bodyParser = require('body-parser');

var settings = {
    port: 3000
};

var app = express();

app.use(express.static(path.join(__dirname, 'static')));

console.log("Listening on http://localhost:" + settings.port + "/")

app.listen(settings.port);

app.use(function(req, res, next) {
    res.status(404);
    
    console.log(req.method + ': ' + req.url);
    
    res.type('txt').send('Not found');
});
