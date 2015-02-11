
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
    
    _findSession: function(sessionID) {
        var i;
        for(i=0; i < this._sessions.length; i++) {
            if(this._sessions[i].id == sessionID) {
                return this._sessions[i];
            }
        }
        return null;
    },

    session: {
        login: function(opts, callback) {
            if(!opts.username || !opts.password) {
                return callback("username or password missing");
            }
            var i;
            for(i=0; i < this._accounts.length; i++) {
                if((this._accounts[i].username == opts.username) && (this._accounts[i].password == opts.password)) {
                    console.log("AAAAAAAAAAAA");
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
        }
    }
    

};
