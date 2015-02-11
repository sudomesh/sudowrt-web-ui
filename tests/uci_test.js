#!/usr/bin/env nodejs

var fs = require('fs');
var util = require('util');
var path = require('path');

var uci = require('../uci.js');

uci.configPath = path.resolve(path.join(__dirname, '../config'))

console.log("get()");
uci.get(null, function(err, data) {
    if(err) {
        return console.error(err);
    }
    console.log(data);

    console.log("");
    console.log("get(package)");
    
    uci.get({package: 'babeld'}, function(err, data) {
        if(err) {
            return console.error(err);
        }
        console.log(data);

        console.log("");
        console.log("get(package, sectionName)");
        
        uci.get({package: 'wireless', section: 'radio0'}, function(err, data) {
            if(err) {
                return console.error(err);
            }
            console.log(data);

            console.log("");
            console.log("get(package, sectionType)");
            
            uci.get({package: 'wireless', type: 'wifi-iface'}, function(err, data) {
                if(err) {
                    return console.error(err);
                }
                console.log(data);
            });
            
        });
    });
});


