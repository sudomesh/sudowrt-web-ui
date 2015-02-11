

var UBus = function(opts) {
    opts = opts || {};
    this.ubusPath = opts.ubusPath || '/ubus';

    this.sessionID = null;
    this.rpc = new $.JsonRpcClient({ ajaxUrl: this.ubusPath });

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

        this.rpc.call(
            'call', [sessionID, obj, method, args],
            function(res) {
                if(callback) {
                    if(res[0] === 0) {
                        callback(null, res[1]);

                    // 6 is ubus' way of saying access denied
                    } else if(res[0] === 6) {
                        callback("ubus: permission denied");
                    } else {
                        callback("ubus: unknown errorc code: " + res[0], res[1]);
                    }
                }
            },
            function(err) {
                if(callback) {
                    callback(err);
                }
            }
        );

    };

    // ubus.call('myobject.mymethod', [args], [callback])
    this.call = function(methodPath, args, callback) {

        if(arguments.length < 1) {
            return;
        }

        var methodPathParts = methodPath.split('.');
        var obj = methodPathParts.pop();
        var method = methodPathParts.join('.');

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
