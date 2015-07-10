<input-settings>

  <h1>{ section_name }</h1>
  <div each={ items }>
    <label for="{ slug }">{ name }</label>
    <input type="{ type }" id="slug" value={ value }><span if={ units }>({ units })</span>
    <button onclick={ parent.save }>save</button>
  </div>

  <script type="es6">
    let RiotControl = require('riotcontrol');
    let self = this;
    

    this.section_name = opts.sectionName;
    this.items = [];

    this.save = (e) => {
      var item = e.item;
      RiotControl.trigger('setting_changed', item);
    }

    RiotControl.on('settings_changed', function(settings) {
      self.items = settings;
      self.update();
    })
   
  </script>
</input-settings>
