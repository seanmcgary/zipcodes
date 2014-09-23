var _ = require('lodash');

var base = {
	port: 9000
};

exports.base = base;
exports.development = _.extend(_.cloneDeep(base), {});
exports.production = _.extend(_.cloneDeep(base), {});