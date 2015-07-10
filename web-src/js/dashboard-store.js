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
  self.uciConfigs = {};

  // Our store's event handlers / API.
  // This is where we would use AJAX calls to interface with the server.
  // Any number of views can emit actions/events without knowing the specifics of the back-end.
  // This store can easily be swapped for another, while the view components remain untouched.

  this.login = function(credentials, callback) {
    ubus.login(credentials.username, credentials.password, function(err, resp) {
      console.log(err);
      console.log(resp);
      if(err) {
        console.error(err);
        callback(err);
      } else {
        callback(null, resp.data.username);
      }
    });
  };

  this.changePassword = function(credentials, callback) {
    ubus.call('password.set', {username: self.username, password: credentials.new_password}, function(err, result) {
      if (err) {
        console.log(err);
        self.trigger('password_error', err);
      } else {
        self.trigger('password_success', result);
      }
    });
  };

  self.on('login', function(credentials) {
    this.login(credentials, function(err, result) {
      if (err) {
        self.trigger('login_error');
      } else {
        self.loggedIn = true;
        self.username = result;
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

  self.on('password_change', function(credentials) {
    self.login({username: self.username, password: credentials.old_password}, function(err, result) {
      if (err) {
        self.trigger('password_error', 'Your password was incorrect');
      } else {
        self.changePassword(credentials, function(err, result) {
          console.log(err);
          console.log(result);
          if (err) {
            self.trigger('password_error', 'There was an error changing your password');
          } else {
            self.trigger('password_success', result);
          }
        });
      }
    });
  });

  this.fetchUciSettings = function() {
    if (self.loggedIn) {
      ubus.call('uci.configs', {}, function(err, result) {
        if (typeof result === 'object' &&
            typeof result.configs === 'object') {

          console.log('configs result: ');
          console.log(result);
          self.configNames = result.configs;
          var configPromises = [];
          _.each(self.configNames, function(configName) {
            configPromises.push(new Promise(function(resolve, reject) {
              ubus.call('uci.get', {config: configName}, function(err, result) {
                if (typeof result === 'object' &&
                    typeof result.values === 'object') {

                  self.uciConfigs[configName] = result.values;
                  resolve(null, result.values);
                } else {
                  resolve(err, null);
                }
              });
            }));
          });

          Promise.all(configPromises).then(function(resultsArray) {
            console.log(self.uciConfigs);
            self.trigger('uci_configs_changed', self.uciConfigs);
          }).catch(function(error) {
            console.error(error);
          });
        }
      });
    }
  };

  self.on('login_changed', function(user) {
    if (user) {
      self.fetchUciSettings();
    }
  });

  self.on('setting_changed', function(setting) {
    console.log(setting);
  });
}
