<input-settings>

  <div each={ sections }>
    <h2>{ title }</h2>
    <div each={ uciInputs }>
      <label for="{ slug }">{ labelTitle }</label>
      <form onsubmit={ parent.save } class="inputs-container">
        <input type="{ format }" id="{ slug }" value={ value }><span if={ units }>({ units })</span>
        <button type="submit">save</button>
      </form>
    </div>
  </div>

  <script type="es6">
    let RiotControl = require('riotcontrol');
    let $ = require('jquery');
    let self = this;
    

    this.section_name = opts.sectionName;
    this.sections = [];

    this.save = (e) => {
      var item = e.item;
      // Better way for getting val of non-'input' 
      var newVal = $(e.currentTarget).parent().find('#' + item.slug).val();
      if (typeof newVal !== 'undefined') {
        item.newVal = newVal;
      }
      RiotControl.trigger('setting_changed', item);
    }

    RiotControl.on('sections_changed', function(sections) {
      self.sections = sections;
      self.update();
    })
   
  </script>
</input-settings>
