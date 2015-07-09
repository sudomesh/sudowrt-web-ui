$ = require('jquery');
require('jsonrpc');

module.exports = function(opts) {
  opts = opts || {};
  this.ubusProtocol = opts.ubusProtocol || 'http://';
  this.ubusPath = opts.ubusPath || '/ubus';
  this.ubusPort = opts.ubusPort || global.location.port;
  this.ubusHost = opts.ubusHost || global.location.hostname;

  this.sessionID = null;

  $.jsonRPC.setup({
    endPoint: this.ubusProtocol + this.ubusHost + ':' + this.ubusPort + this.ubusPath
  });
  
  this._call = function(obj, method, args, callback) {

    var sessionID;
    if((obj == 'session') && (method == 'login')) {
      this.sessionID = null;
      // The string of zeroes is a null session which can only call login
      sessionID = '00000000000000000000000000000000';
    } else {
      sessionID = this.sessionID;
    }

    if(!sessionID) {
      if(callback) {
        callback("Not logged in");
      }
      return;
    }

    console.log([sessionID, obj, method, args]);

    $.jsonRPC.request(
        'call', { 
          params: [sessionID, obj, method, args],
          success: 
            function(resp) {
              console.log(resp);

              if(callback) {
                var result = resp.result;
                if(result[0] === 0) {
                  callback(null, result[1]);
                  // 6 is ubus' way of saying access denied
                } else if(result[0] === 6) {
                  callback("ubus: permission denied");
                } else {
                  callback("ubus: unknown error code: " + result[0], result[1]);
                }
              }
            },
            

          error: function(err) {
            console.log(err);
            if(callback) {
              callback(err);
            }
            
          }
        }
    );

  };

  // ubus.call('myobject.mymethod', [args], [callback])
  this.call = function(methodPath, args, callback) {

    var methodPathParts = methodPath.split('.');
    var obj = methodPathParts[0];
    var method = methodPathParts.slice(1).join('.');

    return this._call(obj, method, args, callback);
  };

  this.login = function(username, password, callback) {
    if(!username || !password) {
      if(callback) {
        callback("username or password missing");
      }
      return;
    }

    return this._call('session', 'login', {
      username: username,
           password: password
    }, function(err, res) {
      if(err) {
        return callback(err, res);
      }
      if(!res.ubus_rpc_session) {
        return callback("login failed: ubus server did not return session id", res);
      }
      this.sessionID = res.ubus_rpc_session;

      callback(null, res);
    }.bind(this));
  };

};
