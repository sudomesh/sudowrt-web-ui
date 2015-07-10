var riot = require('riot');
var UBus = require('./libs/ubus.js');

module.exports = function TodoStore() {
  var ubus = new UBus();

  riot.observable(this) // Riot provides our event emitter.
  
  var self = this

  self.username = '';
  self.loggedIn = false;

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
  })

  self.on('logout', function(user) {
    ubus.logout(function(err, resp) {
      console.log(err);
      console.log(resp);
    });
    self.loggedIn = false;
    self.user = null;
    self.trigger('login_changed', null);
  })

}
