L.ui.view.extend({
	execute: function() {
		var m = new L.cbi.Map('system', {
			caption:     L.tr('System'),
			description: L.tr('Here you can configure the basic aspects of your device like its hostname or the timezone.'),
			collabsible: true
		});

		var s = m.section(L.cbi.TypedSection, 'system', {
			caption:     L.tr('System Properties'),
			teasers:     [ 'hostname', 'zonename', 'languages', 'themes' ],
			readonly:    !this.options.acls.system
		});

		s.tab({
			id:          'general',
			caption:     L.tr('General Settings')
		});

		var t = s.taboption('general', L.cbi.DummyValue, '__time', {
			caption:     L.tr('Local Time')
		});

		t.load = function(sid)
		{
			var id = this.id(sid);

			return L.system.getSystemInfo().then(function(info) {
				var date = new Date();
				var time = info.localtime;

				window.setInterval(function() {
					date.setTime(++time * 1000);

					$('#' + id).text('%04d/%02d/%02d %02d:%02d:%02d'.format(
						date.getUTCFullYear(),
						date.getUTCMonth() + 1,
						date.getUTCDate(),
						date.getUTCHours(),
						date.getUTCMinutes(),
						date.getUTCSeconds()
					));
				}, 1000);
			});
		};


		s.taboption('general', L.cbi.InputValue, 'hostname', {
			caption:     L.tr('Hostname'),
			datatype:    'hostname'
		});


		var z = s.taboption('general', L.cbi.ListValue, 'zonename', {
			caption:     L.tr('Timezone')
		});

		z.load = function(sid) {
			return $.getJSON(L.globals.resource + '/zoneinfo.json').then(function(zones) {
				var znames = [ ];

				for (var i = 0; i < zones.length; i++)
					for (var j = 5; j < zones[i].length; j++)
						znames.push(zones[i][j]);

				znames.sort();

				for (var i = 0; i < znames.length; i++)
					z.value(znames[i]);

				z.zones = zones;
			});
		};

		z.save = function(sid)
		{
			var uci = this.ucipath(sid);
			var val = this.formvalue(sid);

			if (!this.callSuper('save', sid))
				return false;

			for (var i = 0; i < z.zones.length; i++)
				for (var j = 5; j < z.zones[i].length; j++)
					if (z.zones[i][j] == val)
					{
						m.set(uci.config, uci.section, 'timezone', z.zones[i][0]);
						return true;
					}

			m.set(uci.config, uci.section, 'timezone', 'GMT0');
			return true;
		};


		s.tab({
			id:          'logging',
			caption:     L.tr('Logging')
		});

		s.taboption('logging', L.cbi.InputValue, 'log_size', {
			caption:     L.tr('System log buffer size'),
			description: L.tr('kiB'),
			placeholder: 16,
			optional:    true,
			datatype:    'range(0, 32)'
		});

		s.taboption('logging', L.cbi.InputValue, 'log_ip', {
			caption:     L.tr('External system log server'),
			placeholder: '0.0.0.0',
			optional:    true,
			datatype:    'ip4addr'
		});

		s.taboption('logging', L.cbi.InputValue, 'log_port', {
			caption:     L.tr('External system log server port'),
			placeholder: 514,
			optional:    true,
			datatype:    'port'
		});

		s.taboption('logging', L.cbi.ListValue, 'conloglevel', {
			caption:     L.tr('Log output level')
		}).value(8, L.tr('Debug'))
		  .value(7, L.tr('Info'))
		  .value(6, L.tr('Notice'))
		  .value(5, L.tr('Warning'))
		  .value(4, L.tr('Error'))
		  .value(3, L.tr('Critical'))
		  .value(2, L.tr('Alert'))
		  .value(1, L.tr('Emergency'));

		s.taboption('logging', L.cbi.ListValue, 'cronloglevel', {
			caption:     L.tr('Cron Log level')
		}).value(5, L.tr('Debug'))
		  .value(8, L.tr('Normal'))
		  .value(9, L.tr('Warning'));

		s.tab({
			id:          'language',
			caption:     L.tr('Language and Style')
		});


		var l = s.taboption('language', L.cbi.ListValue, 'languages', {
			caption:     L.tr('Language'),
			uci_package: 'luci',
			uci_section: 'main',
			uci_option:  'lang'
		}).value('auto', L.tr('Automatic'));

		l.load = function(sid)
		{
			var langs = m.get('luci', 'languages');
			for (var key in langs)
				if (key.charAt(0) != '.')
					l.value(key, langs[key]);
		};


		var t = s.taboption('language', L.cbi.ListValue, 'themes', {
			caption:     L.tr('Design'),
			uci_package: 'luci',
			uci_section: 'main',
			uci_option:  'mediaurlbase'
		});

		t.load = function(sid)
		{
			var themes = m.get('luci', 'themes');
			for (var key in themes)
				if (key.charAt(0) != '.')
					t.value(themes[key], key);
		};


		var s2 = m.section(L.cbi.NamedSection, 'ntp', {
			caption:      L.tr('Time Synchronization'),
			readonly:    !this.options.acls.system
		});

		var e = s2.option(L.cbi.CheckboxValue, '.enable', {
			caption:      L.tr('Enable NTP client'),
			optional:     true
		});

		e.load = function(sid) {
			return L.system.initEnabled('sysntpd').then(function(enabled) {
				e.options.initial = enabled;
			});
		};

		e.save = function(sid) {
			if (this.formvalue(sid))
				return L.system.initEnable('sysntpd');
			else
				return L.system.initDisable('sysntpd');
		};

		s2.option(L.cbi.CheckboxValue, 'enable_server', {
			caption:      L.tr('Enable NTP server')
		}).depends('.enable');

		s2.option(L.cbi.DynamicList, 'server', {
			caption:      L.tr('NTP server candidates'),
			datatype:     'host'
		}).depends('.enable');

		return m.insertInto('#map');
	}
});
