
var validateInput = function(e) {
    console.log(e);
}


var luci2;

var pageInit = function() {

    // init jeditable functions
    $('.editable').editable(function(value, settings) {

    }, {
      type: 'text',
      width: '30',
      height: '10',
      tooltip: "Click to edit",
      select: true,
      submit: 'ok',
      onsubmit: validateInput
    });

    luci2 = new LuCI2('js/luci2');
    luci2.network.load().then(function() {
        var interfaces = luci2.network.getInterfaces();
        console.log(interfaces);
    });

}


$(document).ready(pageInit);
