var _ = require('lodash');

var env = process.env.NODE_ENV || 'development';

module.exports = {
	server: require('./server')[env],
	redis: require('./redis')[env],
	database: require('./database')[env],
	env: env
};