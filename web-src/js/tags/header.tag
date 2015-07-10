<header>
  <span>
    <a title="Dashboard" class="iconhref" onclick={ logout }>
      Dashboard
      <img src="images/dashboard.png" class="icon" alt="dashboard" />
    </a>
  </span>

  <h1>sudowrt settings</h1>

  <span if={ loggedIn }>
    Logged in as: { username }
    <a title="Logout" class="iconhref" onclick={ logout }>
      Logout
      <img src="images/logout.png" class="icon" alt="Logout" />
    </a>
  </span>

  <span if={ !loggedIn }>
    <a title="Login" class="iconhref" onclick={ login }>
      Login
      <img src="images/login.png" class="icon" alt="Login" />
    </a>
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
