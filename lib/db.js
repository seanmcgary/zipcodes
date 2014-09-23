var _ = require('lodash');
var q = require('q');
var async = require('async');

var fs = require('fs');
var path = require('path');
var redis = require('redis');
var logwrangler = require('logwrangler');
var logger = logwrangler.create();

function Db(redisConfig, databasePath){
	var self = this;
	self.cache = redis.createClient(redisConfig.port, redisConfig.host);

	self.database = databasePath;

	var deferred = q.defer();
	self.ready = deferred.promise;

	self.cache.on('error', function(err){
	    logger.log({
			level: logger.levels.ERROR,
			ns: 'redis',
			message: 'error',
			data: err
		});
	});

	self.cache.on('connect', function(){
	    logger.log({
			level: logger.levels.INFO,
			type: logger.types.SUCCESS,
			ns: 'redis',
			message: 'connected'
		});
	});

	self.cache.on('ready', function(){
	    logger.log({
			level: logger.levels.INFO,
			type: logger.types.SUCCESS,
			ns: 'redis',
			message: 'ready'
		});
	    deferred.resolve();
	});
};

Db.prototype.populateDatabase = function(){
	var self = this;

	return self.ready
	.then(function(){
		logger.info({
			message: 'building database'
		});

		var deferred = q.defer();

		fs.readFile(self.database, function(err, file){
			if(err){
				return deferred.reject(err);
			}

			file = file.toString();
			var json;
			try {
				json = JSON.parse(file);
			} catch(e){
				logger.error({
					message: 'invalid json database',
					data: {
						error: e
					}
				});
				deferred.reject(e);
			}

			if(json){
				var queue = _.map(json, function(z){
					return function(cb){

						if(z.zip.length < 5){

							var delta = 5 - z.zip.length;
							var fill = _.map(new Array(delta), function(f){ return '0'; });

							z.zip = [fill.join(''), z.zip].join('');
						}

						self.cache.set(z.zip, JSON.stringify(z), function(){
							cb();
						});
					};
				});

				async.parallel(queue, function(){
					logger.info({
						message: 'database built',
						data: {
							zipcodes: queue.length
						}
					});
					deferred.resolve();
				}, 10);
			}
		});

		return deferred.promise;
	});
};

Db.prototype.getZipcode = function(zipcode){
	var self = this;
	var deferred = q.defer();

	self.cache.get(zipcode, function(err, data){
		if(err){
			return deferred.reject(e);
		}

		var json;
		try {
			json = JSON.parse(data);
		} catch(e){
			logger.error({
				message: 'invalid zipcode payload',
				data: {
					zipcode: zipcode,
					error: e
				}
			});
			deferred.reject({
				message: 'database_error',
				error: e
			});
		}

		if(json){
			deferred.resolve(json);
		}

		deferred.reject({ message: 'invalid_zipcode' });
	});

	return deferred.promise;
};

module.exports = Db;