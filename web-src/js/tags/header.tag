<header>

  <h1>sudowrt settings</h1>

  <span if={ loggedIn }>
    Logged in as: { username }
    <div title="Logout" class="clickable" onclick={ logout }>
      Logout <span class="glyphicon glyphicon-log-out" alt="Logout"></span>
    </div>
  </span>

  <span if={ !loggedIn }>
    <div title="Login" class="clickable" onclick={ login }>
      Login <span class="glyphicon glyphicon-log-in" alt="Login"></span>
    </div>
  </span>

  <script type="es6">

    let RiotControl = require('riotcontrol')
    let self = this;

    RiotControl.on('login_changed', function(user) {
      if (user) {
        self.username = user;
        self.loggedIn = true;
      } else {
        self.loggedIn = false;
      }
      self.update();
    })

    this.login = (e) => {
      RiotControl.trigger('login_open');
    }

    this.logout = (e) => {
      RiotControl.trigger('logout');
    }
    
  </script>
</header>
