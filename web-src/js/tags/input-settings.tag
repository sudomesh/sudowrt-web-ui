<input-settings>

  <div class="settings-container" each={ sections }>
    <h2>{ title }</h2>
    <div class="input-section" each={ uciInputs }>
      <label for="{ slug }-input">{ labelTitle }</label>
      <form onsubmit={ parent.parent.save } class="pure-form inputs-container">
        <input id="{ slug }-input" type="{ format }" value={ this.value } onchange={ parent.parent.inputChanged }><span if={ units }>({ units })</span>
        <button type="submit" class="pure-button">save</button>
      </form>
    </div>
  </div>

  <script type="es6">
    let RiotControl = require('riotcontrol');
    let _ = require('lodash');
    let self = this;
    

    this.section_name = opts.sectionName;
    this.sections = [];

    this.save = (e) => {
      var item = e.item;
      console.log(item.value);
      RiotControl.trigger('setting_changed', item);
    }

    this.inputChanged = (e) => {
      var item = e.item;
      item.value = e.target.value;
    }

    RiotControl.on('sections_changed', function(sections) {
      self.update({sections: sections});
    })
   
    RiotControl.on('login_changed', function(user) {
      if (!user) {
        self.update({sections: []});
      }
    })

  </script>
</input-settings>
