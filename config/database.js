var _ = require('lodash');
var fs = require('fs');
var path = require('path')

var base = {
	location: path.normalize(__dirname + '/../zipcodes.json')
};

exports.base = base;
exports.development = _.extend(_.cloneDeep(base), {});
exports.production = _.extend(_.cloneDeep(base), {});