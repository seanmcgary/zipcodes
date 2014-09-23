var _ = require('lodash');

var base = {
	host: '127.0.0.1',
	port: 6379
};

exports.base = base;
exports.development = _.extend(_.cloneDeep(base), {});
exports.production = _.extend(_.cloneDeep(base), {});