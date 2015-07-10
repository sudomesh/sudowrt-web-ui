var riot = require('riot');
var UBus = require('./libs/ubus.js');
var _ = require('lodash');
var promise = require('es6-promise');

module.exports = function TodoStore() {
  var ubus = new UBus();

  riot.observable(this) // Riot provides our event emitter.
  
  var self = this

  self.username = '';
  self.loggedIn = false;
  self.uciPackages = {};

  // Our store's event handlers / API.
  // This is where we would use AJAX calls to interface with the server.
  // Any number of views can emit actions/events without knowing the specifics of the back-end.
  // This store can easily be swapped for another, while the view components remain untouched.

  self.on('login', function(credentials) {
    ubus.login(credentials.username, credentials.password, function(err, resp) {
      console.log(err);
      console.log(resp);
      if(err) {
        console.error(err);
        self.trigger('login_error')        
      } else {
        self.loggedIn = true;
        self.username = resp.data.username;
        self.trigger('login_changed', self.username)        
      }
    });
  });

  self.on('logout', function(user) {
    ubus.logout(function(err, resp) {
      console.log(err);
      console.log(resp);
    });
    self.loggedIn = false;
    self.user = null;
    self.trigger('login_changed', null);
  });

  this.fetchSettings = function() {
    if (self.loggedIn) {
      ubus.call('uci.get', {}, function(err, result) {
        if (typeof result === 'object' &&
            typeof result.data === 'object' &&
            typeof result.data.packages === 'object') {

          self.packageNames = result.data.packages;
          var packagePromises = [];
          _.each(self.packageNames, function(package) {
            packagePromises.push(new Promise(function(resolve, reject) {
              ubus.call('uci.get', {package: package}, function(err, result) {
                if (typeof result === 'object' &&
                    typeof result.data === 'object') {

                  resolve(result.data);
                } else {
                  reject();
                }
              });
            }));
          });

          Promise.all(packagePromises).then(function(resultsArray) {
            _.each(resultsArray, function(package) {
              _.each(package, function(uciPackage, packageName) {
                self.uciPackages[packageName] = uciPackage;
              });
            });
            self.trigger('settings_changed', self.uciPackages);
          }).catch(function(error) {
            console.error(error);
          });
        }
      });
    }
  };

  self.on('login_changed', function(user) {
    if (user) {
      self.fetchSettings();
    }
  });

  self.on('setting_changed', function(setting) {
    console.log(setting);
  });
}
