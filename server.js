#!/usr/bin/env nodejs

var fs = require('fs');
var express = require('express');
var util = require('util');
var path = require('path');
var bodyParser = require('body-parser');
var jsonrpc = require('node-express-json-rpc2-async');

var ubusSim = require('./ubus_simulator.js');

var settings = {
    port: 3000
};

var app = express();

// If we want to try to serve the old luci2_app
// app.use(express.static(path.join(path.join(__dirname, 'static'), 'luci2_app')));
// If we want to serve static content from our (old) static path
// app.use(express.static(path.join(__dirname, 'static')));

// If we want to serve static content from our build path
app.use(express.static(path.join(__dirname, 'web-build')));

console.log("Listening on http://localhost:" + settings.port + "/")

app.use(jsonrpc());

var ubusFunction = function(req, res, next) {
	console.log('RPC: ' + util.inspect(res.rpc));
	res.rpc('call', function(params, respond){

			console.log("CALL: " + util.inspect(params));
			
			if(params.length < 3) {
					return respond(jsonrpc.INVALID_PARAMS);
			}

			var sessionID = params[0];
			var obj = params[1];
			var method = params[2];
			var opts = {};
			if(params.length > 3) {
					opts = params[3];
			}

			if((obj[0] == '_') || (method[0] == '_')) {
					return respond(jsonrpc.INVALID_PARAMS)
			}

			var ubusFun; 
			if (typeof ubusSim[obj] === 'object' &&
					typeof ubusSim[obj][method] === 'function') {
				ubusFun = ubusSim[obj][method];
			} else if (typeof ubusSim[method] === 'function') {
				ubusFun = ubusSim[method];
			} else {
				return respond(jsonrpc.INVALID_PARAMS)
			}

			ubusFun.apply(ubusSim, [opts, function(err, res) {
					res = {result: res};

					if(err) {
							console.error("ERROR: " + err + " | " +  util.inspect(res));
					} else {
							console.log("RESPOND: " + util.inspect(res));
					}

					respond(res);
			}]);

			// if everything is OK return result object:
//        respond({ result: {foo: 'bar'}});

			// if something is wrong, return an error code:
//        respond(jsonrpc.INVALID_PARAMS)
			// OR an extended error object:
/*
			respond({
					error: {
							code: jsonrpc.INVALID_PARAMS,
							message: 'You gave me invalid parameters!',
							data: data
					}
			});
*/
	});
};
 
app.post('/ubus', ubusFunction);
app.post('/ubus*', ubusFunction);

app.use(function(req, res, next) {
    res.status(404);
    
    console.log(req.method + ': ' + req.url);
    res.type('txt').send('Not found');
});


app.listen(settings.port);
