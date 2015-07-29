
var validateInput = function(e) {
    console.log(e);
}

var luci2;
var ubus;


var populateTemplate = function() {

    ubus.call('uci.get', {
        package: 'tunneldigger', 
        section: 'main'
    }, function(err, resp) {
        if(err) {
            return console.error(err);
        }
        var conf = resp.data['main'];

        ubus.call('uci.set', {
            package: 'tunneldigger', 
            section: 'main',
            option: 'limit_bw_down',
            value: '4096kbit'
        }, function(err, resp) {
            if(err) {
                return console.error(err);
            }

            $('#downloadSpeedLimit').html(parseInt(conf.limit_bw_down));
            $('#uploadSpeedLimit').html(parseInt(conf.limit_bw_up));

            console.log("Success setting lollerskater: " + resp);
        });
    });

};

var pageInit = function() {

    // init jeditable functions
    $('.editable').editable(function(value, settings) {

    }, {
      type: 'text',
      width: '30',
      height: '14',
      tooltip: "Click to edit",
      select: true,
      submit: 'ok',
      onsubmit: validateInput
    });


    ubus = new UBus();
    ubus.login('root', 'foobar', function(err, res) {
        if(err) {
            return console.error(err);
        }
        console.log("Logged in!");
        console.log(res);

        populateTemplate();

    });

    

/*
    luci2 = new LuCI2('js/luci2');
    luci2.network.load().then(function() {
        var interfaces = luci2.network.getInterfaces();
        console.log(interfaces);
    });
*/

}


$(document).ready(pageInit);
