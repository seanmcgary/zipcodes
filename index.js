var _ = require('lodash');
var q = require('q');
var logwrangler = require('logwrangler');
var logger = logwrangler.create();

var config = require('./config');
var DB = require('./lib/db');

var database = new DB(config.redis, config.database.location);

var express = require('express');
var server = express();
var expressWrangler = require('express-wrangler');

var expressLogger = logwrangler.create({
	logOptions: {
		ns: 'express'
	}
}, true);
server.use(expressWrangler({
	logger: expressLogger
}));


server.get('/zipcode/:code', function(req, res){
	database.getZipcode(req.params.code)
	.then(function(zipcode){
		res.json(zipcode);
	}, function(err){
		res.json(500, err);
	});
});

database.populateDatabase()
.then(function(){
	server.listen(config.server.port, function(){
		expressLogger.success({
			message: 'server started',
			data: {
				port: config.server.port
			}
		});
	});
});


