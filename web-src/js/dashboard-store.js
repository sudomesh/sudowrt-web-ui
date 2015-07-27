var riot = require('riot');
var UBus = require('./libs/ubus.js');
var _ = require('lodash');
var promise = require('es6-promise');
var moment = require('moment');

module.exports = function dashboardStore() {
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
        // TODO - check that these are all set/valid first?
        localStorage.setItem('sessionUsername', resp.data.username);
        localStorage.setItem('sessionID', resp.ubus_rpc_session);
        localStorage.setItem('sessionExpiration', moment().add(resp.expires, 'seconds').toISOString());
        callback(null, resp.data.username);
      }
    });
  };

  this.changePassword = function(credentials, callback) {
    if (self.loggedIn) {
      ubus.call('password.set', {username: self.username, password: credentials.new_password}, function(err, result) {
        if (err) {
          console.log(err);
          self.trigger('password_error', err);
        } else {
          self.trigger('password_success', result);
        }
      });
    } else {
      self.trigger('password_error', 'You must be logged in');
      self.trigger('login_changed', null);
    }
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
        self.trigger('password_error', 'There was an error changing your password.');
      } else {
        self.changePassword(credentials, function(err, result) {
          console.log(err);
          console.log(result);
          if (err) {
            self.trigger('password_error', 'There was an error changing your password.');
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

  self.on('saved_session', function(session) {
    if (moment().isBefore(moment(session.expiration))) {
      ubus.sessionID = session.id;
      // TODO: We should just have a dumb "check if I'm authenticated" ubus call here
      self.loggedIn = true;
      self.fetchUciSettings();
      self.trigger('login_changed', session.username);

    } else {
      localStorage.setItem('sessionUsername', null);
      localStorage.setItem('sessionID', null);
      localStorage.setItem('sessionExpiration', null);
    }
  });

  self.on('login_changed', function(user) {
    if (user) {
      self.fetchUciSettings();
    } else {
      ubus.sessionID = null;
    }
  });

  self.on('setting_changed', function(setting) {

    if (self.loggedIn) {
      var uciSet = {
        config: setting.section,
        section: setting.key,
        values: {}
      };

      uciSet.values[setting.toChange] = setting.newVal;

      ubus.call('uci.set', uciSet, function(err, result) {
        if (!err) {

          // Right now we're just going to "commit"
          // but ideally, we'd keep track of changes and have a "save and apply" button
          ubus.call('uci.commit', { config: setting.section }, function(err, result) {
            if (!err) {
              self.trigger('uncommitted_changes', result);
            }
          });
        } else {
          console.log(err);
          self.trigger('setting_changed_error', err);
        }
      });
     
    } else {
      self.trigger('password_error', 'You must be logged in');
      self.trigger('login_changed', null);
    }
  });
}
