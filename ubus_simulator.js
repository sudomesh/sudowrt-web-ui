
module.exports = {

    _accounts: [
        {
            username: 'root',
            password: 'foobar'
        }
    ],

    _acl: {
        'access-group': {
            superuser: ["read", "write"],
            unauthenticated: ["read"]
        },
        'ubus': {
            '*': ['*'],
            session: ["access", "login"]
        },
        'uci': {
            '*': ["read", "write"]
        }
    },

    _sessions: [],

    _beginSession: function(account) {
        function randomString(len) {
            var str = '';
            var i;
            for(i=0; i < len; i++) {
                str += Math.round(Math.random() * 10).toString();
            }
            return str;
        }

        var session = {
            id: randomString(32),
            account: account
        };

        this._sessions.push(session);
        return session;
    },
    
    _findSession: function(sessionID, del) {
        if(!sessionID) {
            return null;
        }
        var i;
        for(i=0; i < this._sessions.length; i++) {
            if(this._sessions[i].id == sessionID) {
                if(del) {
                    this._sessions.splice(i, 1);
                }
                return this._sessions[i];
            }
        }
        return null;
    },

    _delSession: function(sessionID) {
        return this.findSession(sessionID, true);
    },

    session: {
        login: function(opts, callback) {
            if(!opts.username || !opts.password) {
                return callback("username or password missing");
            }
            var i;
            for(i=0; i < this._accounts.length; i++) {
                if((this._accounts[i].username == opts.username) && (this._accounts[i].password == opts.password)) {
                    var session = this._beginSession(this._accounts[i]);
                    return callback(null, [0, {
                        ubus_rpc_session: session.id,
                        timeout: 99999999,
                        expires: 99999999,
                        acls: this._acl,
                        data: {
                            username: this._accounts[i].username
                        }
                    }]);
                }
            }
            return callback("Login failed for user: " + opts.username, [6]);
        },
        destroy: function(opts, callback) {
            var session = this._delSession(opts.session);
            if(!session) {
                return callback("Failed to destroy session: Session does not exist", [1, {}]); // TODO what is the expected failure data and error code?
            }
            // TODO what is the expected returned data?
            callback(null, [0, {}]);
        }
    },

    'network.device': {
        status: function(opts, callback) {
            // TODO implement
        }
    },

    uci: {
        'get': function(opts, callback) {
            opts = opts || {};
            if(!opts.package) {
                
            }
            // TODO implement a simple UCI file parser

        },
        'set': function(opts, callback) {
            // TODO implement
        },
        'add': function(opts, callback) {
            // TODO implement
        },
        'delete': function(opts, callback) {
            // TODO implement
        }
    },

    file: {
        'exec': function(opts, callback) {
            // TODO implement
        }
    }
};
