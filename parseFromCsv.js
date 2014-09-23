var _ = require('lodash');
var path = require('path');
var fs = require('fs');

if(process.argv.length != 4){
	process.exit();
}

var file = path.resolve(process.argv[2]);

fs.readFile(file, function(err, data){
	if(err){
		console.log(err);
		process.exit();
	}

	data = _.map(data.toString().split(/\r\n/), function(r){
		return _.map(r.split(/,(?=[",])/g), function(m){ return m.replace(/"+/g, '') });
	});
	var keys = data.shift();

	data = _.map(data, function(r){
		var row = {};
		_.each(keys, function(k, i){
			row[k] = r[i];
		});
		return row;
	});
	fs.writeFileSync(path.resolve(process.argv[3]), JSON.stringify(data, '\t'));
});