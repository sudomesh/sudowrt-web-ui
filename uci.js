
var path = require('path');

var async = require('async');
var extend = require('extend');
var findit = require('findit');
var LineReader = require('line-by-line');

// Based on:
// http://wiki.openwrt.org/doc/techref/ubus#access_to_ubus_over_http

// This is surely a very buggy and non-strict parser
// It was written only for the ubus simulator
// and the ubus simulator only exists to make it
// easier for developers to test the sudowrt 
// web admin interface

// Known limitations
//
// * Only understands one package per file (not sure if spec allows multiple)

module.exports = {

    configPath: path.resolve(path.join(__dirname, 'config')),

    _withEachFile: function(eachCallback, callback) {
        var configPath = this.configPath;
        var finder = findit(configPath);
        var files = [];
        finder.on('file', function(file, stat) {
            files.push(file);
        });
        finder.on('end', function() {
            async.eachSeries(files, eachCallback, callback);
        });        
    }, 

    listPackages: function(callback) {

        var packages = [];
        this._withEachFile(function(file, callback) {
            this.parseFile(file, function(err, conf) {
                if(err) {
                    return callback(err);
                }
                var keys = Object.keys(conf);
                if(keys.length < 1) {
                    return callback();
                }
                var pkgName = keys[0];
                if(packages.indexOf(pkgName) >= 0) {
                    return callback();
                }
                packages.push(pkgName);
                callback();
            });           
 
        }.bind(this), function(err) {
            if(err) {
                return callback(err);
            }
            callback(null, {packages: packages});
        });
    },

    parseFile: function(filePath, callback) {
        var sections = {};
        var pkgName;
        var lr = new LineReader(filePath, {
            encoding: 'utf8', 
            skipEmptyLines: true
        });

        var sectionName;
        var anonCount = 0;

        lr.on('line', function(line) {

            if(line.match(/^\s*#/)) { // skip comments
                return;
            }

            line = line.replace(/^\s+/g, ''); // remove leading whitespace
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
                if(parts.length > 2) { // named section
                    sectionName = parts.slice(2).join(' ');
                } else { // anonymous section
                    // TODO it is not documented how ubus returns these
                    sectionName = 'anonymous'+anonCount++;
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
        }.bind(this));

        lr.on('error', function(err) {
            lr.close();
            callback(err);
        });

        lr.on('end', function() {
            if(!pkgName) {
                pkgName = path.basename(filePath);
            }
            var resp = {};
            resp[pkgName] = sections;
            callback(null, resp);
        });
    },

    parsePackage: function(pkg, callback) {

        var pkgConf = {};
        this._withEachFile(function(file, callback) {
            this.parseFile(file, function(err, conf) {
                if(err) {
                    return callback(err);
                }
                var keys = Object.keys(conf);
                if(keys.length < 1) {
                    return callback();
                }
                var pkgName = keys[0];
                if(pkgName == pkg) {
                    extend(true, pkgConf, conf);
                }
                callback();
            });
        }.bind(this), function(err) {
            if(err) {
                return callback(err);
            }
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
            resp[sectionName] = conf[pkg][sectionName];

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
        callback("Not implemented");
    },

    getOptionFromSectionOfType: function(pkg, sectionType, option, callback) {
        // TODO implement
        callback("Not implemented");
    },

    get: function(opts, callback) {
        opts = opts || {};
        if(!opts.package) {
            return this.listPackages(callback);
        }

        if(opts.section) { // section name
            if(opts.option) {
                return this.getOptionFromSectionWithName(opts.package, opts.section, opts.option, callback);
            }
            return this.getSectionWithName(opts.package, opts.section, callback);
        } else if(opts.type) { // section type
            if(opts.option) {
                return this.getOptionFromSectionOfType(opts.package, opts.type, opts.option, callback);
            }
            return this.getSectionsOfType(opts.package, opts.type, callback);
        } else { // neither section name nor section type specified
            return this.parsePackage(opts.package, callback);
        }
    }

};
