
var path = require('path');

var extend = require('extend');
var findit = require('findit');
var LineReader = require('line-by-line');

// This is surely a very buggy and non-strict parser
// It was written only for the ubus simulator
// and the ubus simulator only exists to make it
// easier for developers to test the sudowrt 
// web admin interface

// Known limitations
//
// * Only understands one package per file (not sure if spec allows multiple)

module.exports = {

    listPackages: function(callback) {
        var configPath = path.resolve(path.join(__dirname, 'config'));
        var finder = findit(configPath);
        var packages = [];
        finder.on('file', function(file, stat) {
            this.parseFile(file, function(conf) {
                var keys = Object.keys(conf);
                if(keys.length < 1) {
                    return;
                }
                var pkgName = keys[0];
                if(packages.indexOf(pkgName) >= 0) {
                    return;
                }
                packages.push(pkgName);
            });
        });
        finder.on('end', function() {
            callback(null, {packages: packages});
        });
    },

    parseFile: function(file, callback) {
        var sections = {};
        var pkgName;
        var lr = new LineReader(filePath, {
            encoding: 'utf8', 
            skipEmptyLines: true
        });

        var sectionName;

        lr.on('line', function(line) {
            if(line.match(/^\s*#/)) { // skip comments
                return;
            }
            var parts = line.split(/\s+/);
            if(parts.length < 2) {
                return;
            }
            var i;
            for(i=0; i < parts.length; i++) {
                parts[i] = parts[i].replace(/['"]+/g, '');
            }
            if(parts[0] == 'package') { // package name
                // stop processing file if a second package name is encountered
                if(pkgName) {
                    lr.close();
                    return;
                }
                pkgName = parts[1];
            } else if(parts[0] == 'config') { // section
                var stype = parts[1];
                if(parts.length > 2) [ // named section
                    sectionName = parts.slice(2).join(' ');
                } else { // anonymous section
                    // TODO it is not documented how ubus returns these
                    sectionName = 'anonymous';
                }
                sections[sectionName] = {
                    '.type': stype
                };
            } else if(parts[0] == 'option') { // option
                if(!sectionName) {
                    return;
                }
                if(parts.length < 3) {
                    return;
                }
                var optionName = parts[1];
                var val = parts.slice(2).join(' ');
                sections[sectionName][optionName] = val;
            } else if(parts[0] == 'list') { // list option
                if(!sectionName) {
                    return;
                }
                if(parts.length < 3) {
                    return;
                }
                var optionName = parts[1];
                var val = parts.slice(2).join(' ');
                if(!sections[sectionName][optionName]) {
                    sections[sectionName][optionName] = [val];
                } else {
                    sections[sectionName][optionName].push(val);
                }
            }
        });

        lr.on('error', function(err) {
            lr.close();
            callback(err);
        });

        lr.on('end', function() {
            if(!pkgName) {
                pkgName = path.basename(file);
            }
            var resp = {};
            resp[pkgName] = sections;
            callback(null, resp);
        });
    },

    parsePackage: function(pkg, callback) {
        var finder = findit(configPath);
        var pkgConf = {};
        finder.on('file', function(file, stat) {
            this.parseFile(file, function(conf) {
                var keys = Object.keys(conf);
                if(keys.length < 1) {
                    return;
                }
                var pkgName = keys[0];
                if(pkgName == pkg) {
                    extend(true, pkgConf, conf);
                }
            });
        });
        finder.on('end', function() {
            callback(null, pkgConf);
        });
    },

    getSectionWithName: function(pkg, sectionName, callback) {
        this.parsePackage(pkg, function(err, conf) {
            if(err) {
                return callback(err);
            }
            if(!conf || !conf[pkg] || !conf[pkg][sectionName]) {
                return callback("No such section: " + sectionName);
            }

            var resp = {};
            resp[pkg] = {};
            resp[pkg][sectionName] = conf[pkg][sectionName];

            callback(null, resp);
        });
    },

    getSectionsOfType: function(pkg, sectionType, callback) {
        this.parsePackage(pkg, function(err, conf) {
            if(err) {
                return callback(err);
            }
            if(!conf || !conf[pkg]) {
                return callback("No such package: " + pkg);
            }

            var resp = {};
            resp[pkg] = {};

            var key;
            for(key in conf[pkg]) {
                if(!conf[pkg][key] || !conf[pkg][key]['.type'] || (conf[pkg][key]['.type'] != sectionType)) {
                    continue;
                }
                resp[pkg][key] = conf[pkg][key];
            }

            callback(null, resp);
        });
    },

    getOptionFromSectionWithName: function(pkg, sectionName, option, callback) {
        // TODO implement
    },

    getOptionFromSectionOfType: function(pkg, sectionType, option, callback) {
        // TODO implement
    },

    get: function(opts, callback) {
        opts = opts || {};
        if(!opts.package) {
            return listPackages(callback);
        }
        
        // TODO implement so it matches spec from:
        // http://wiki.openwrt.org/doc/techref/ubus#access_to_ubus_over_http
        return null;
    }

};
