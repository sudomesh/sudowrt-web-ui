
var path = require('path');
var fs = require('fs');
var util = require('util');
var _ = require('lodash');

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
// * Only understands one uci package per config file (not sure if spec allows multiple)

module.exports = {

    configPath: path.resolve(path.join(__dirname, 'uci-config')),

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

    listConfigs: function(callback) {

        var configs = [];
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
                if(configs.indexOf(pkgName) >= 0) {
                    return callback();
                }
                configs.push(pkgName);
                callback();
            });           
 
        }.bind(this), function(err) {
            if(err) {
                return callback(err);
            }
            callback(null, configs);
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
                var anonymous = false;
                if(parts.length > 2) { // named section
                    sectionName = parts.slice(2).join(' ');
                } else { // anonymous section
                    // TODO it is not documented how ubus returns these
                    sectionName = 'anonymous'+anonCount++;
                    anonymous = true;
                }



                sections[sectionName] = {
                    '.type': stype,
                    '.name': sectionName,
                    '.filePath': filePath,
                    '.anonymous': anonymous
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

    parseConfig: function(pkg, callback) {

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
            console.log('witheachfile pkgConf: ');
            console.log(pkgConf);
            if(err) {
                return callback(err);
            }
            callback(null, pkgConf);
        });
    },

    getSectionWithName: function(pkg, sectionName, callback) {
        this.parseConfig(pkg, function(err, conf) {
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
        this.parseConfig(pkg, function(err, conf) {
            if(err) {
                return callback(err);
            }
            if(!conf || !conf[pkg]) {
                return callback("No such config: " + pkg);
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
        if(!opts.config) {
            return this.listConfigs(callback);
        }

        if(opts.section) { // section name
            if(opts.option) {
                return this.getOptionFromSectionWithName(opts.config, opts.section, opts.option, callback);
            }
            return this.getSectionWithName(opts.config, opts.section, callback);
        } else if(opts.type) { // section type
            if(opts.option) {
                return this.getOptionFromSectionOfType(opts.config, opts.type, opts.option, callback);
            }
            return this.getSectionsOfType(opts.config, opts.type, callback);
        } else { // neither section name nor section type specified
            return this.parseConfig(opts.config, function(err, result) {
              if (typeof result === 'object') {
                // Arbitrarily choosing first to match ubus uhttpd behavior
                // this logic may make sense to move into parseConfig
                var first = _.find(result, function(r) {
                  return typeof r === 'object';
                });
                callback(err, first);
              } else {
                if (typeof callback === 'function') {
                  callback(err, result);
                }
              }
            });
        }
    },

    writeSection: function(section, callback) {

        if(!section['.type'] || !section['.filePath'] || !section['.name']) {
            return callback("Config file section was missing .type, .name or .filePath: " + util.inspect(section));
        }

        // Write section header, e.g: "config interface 'lan'"
        var txt = "config " + section['.type'];
        if(!section['.anonymous']) {
            txt += " '" + section['.name'] + "'";
        }
        txt += "\n";
            
        // Write "option" and "list" lines
        var optName, prop, i;
        for(optName in section) {
            if(optName[0] == '.') { // don't copy properties starting with a dot
                continue;
            }
            optVal = section[optName];
            if(optVal instanceof Array) { // this is a list
                for(i=0; i < optVal.length; i++) {
                    txt += "\t" + "list " + optName + " '" + optVal[i] + "'\n"
                }
            } else { // this is a normal option
                txt += "\t" + "option " + optName + " '" + optVal + "'\n"
            }
        }
        txt += "\n";

        fs.appendFile(section['.filePath'], txt, function(err) {
            if(err) {
                return callback("Could not write to config file: " + section['.filePath'] + " | " + err);
            }
            callback();
        });
    },

    writeConfig: function(conf, callback) {

        var keys = Object.keys(conf);
        var pkg = keys[0];

        var sections = [];
        var files = []; // files associated with sections
        var sname, section;
        for(sname in conf[pkg]) {
            section = conf[pkg][sname];
            sections.push(section);
            if(files.indexOf(section['.filePath']) < 0) {
                files.push(section['.filePath']);
            }
        }
        
        // delete old config files
        async.eachSeries(files, fs.unlink, function(err) {
            if(err) {
                return callback("Error deleting old config files: " + err);
            }
            // write (modified) config sections to files
            async.eachSeries(sections, this.writeSection, callback);
        }.bind(this));
    },

    // Set *shouldn't* add new sections
    set: function(opts, callback) {
        opts = opts || {};

        if(!opts.config || !opts.section || !opts.values) {
            return callback("Missing config, section or values");
        }

        this.parseConfig(opts.config, function(err, conf) {
            if(err) {
                return callback(err);
            }

            if(!conf[opts.config] || !conf[opts.config][opts.section]) {
                return callback("Config or section does not exist");
            }

            _.each(opts.values, function(value, key) {
              conf[opts.config][opts.section][key] = value;
            });

            this.writeConfig(conf, function(err) {
                callback(err);
            });
        }.bind(this));
    }

};
