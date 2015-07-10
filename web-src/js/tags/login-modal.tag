<login-modal>
  <!-- http://tympanus.net/codrops/2013/06/25/nifty-modal-window-effects/ -->
  <div class="md-modal md-effect-1 {md-show: dialogShowing}">
    <div class="md-content">
      <h3>Login</h3>
      <div>
        <form onsubmit={ login }>
          <input name="username" type="text">
          <input name="password" type="password">
          <button>Submit</button>
        </form>
        <button onclick={ close }>close</button>
      </div>
    </div>
  </div>
  <div class="md-overlay" onclick={ close }></div>

  <script type="es6">

    let RiotControl = require('riotcontrol')
    let self = this;

    this.dialogShowing = false;

    this.login = (e) => {
      if (self.username && self.password) {
        RiotControl.trigger('login', {
          username: self.username.value,
          password: self.password.value
        });
      }
    }

    RiotControl.on('login_open', function() {
      self.dialogShowing = true;
      self.update();
    })
    
    RiotControl.on('login_changed', function(user) {
      if (user) {
        self.close();
      }
    })

    RiotControl.on('login_close', function() {
      self.close();
    })

    this.close = (e) => {
      self.dialogShowing = false;
      self.username.value = '';
      self.password.value = '';
      self.update();
    }
    
  </script>
</login-modal>
