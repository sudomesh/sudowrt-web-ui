L.ui.view.extend({
	execute: function() {
		var self = this;

		var m = new L.cbi.Map('wireless', {
			caption:	L.tr('Wireless configuration')
		});

		var s = m.section(L.cbi.TypedSection, 'wifi-device', {
			caption:	L.tr('WiFi devices'),
			collabsible:	true
		});

		(s.option(L.cbi.DummyValue, '__name', {
			caption:	L.tr('Device')
		})).ucivalue = function(sid)
		{
			return sid;
		};

		s.option(L.cbi.CheckboxValue, 'disabled', {
			caption:	L.tr('Disabled')
		});

		s.option(L.cbi.InputValue, 'channel', {
			caption:	L.tr('Channel')
		});

		var s_1 = s.subsection(L.cbi.TypedSection, 'wifi-iface', {
			caption:	L.tr('Device interfaces'),
			addremove:	true,
			add_caption:	L.tr('Add interface …')
		});

		s_1.filter = function(section, parent_sid) {
			return section.device == parent_sid;
		};

		s_1.add = function(name, sid) {
			var iface = this.ownerMap.add('wireless', 'wifi-iface');
			this.ownerMap.set('wireless', iface, 'device', sid);
		};

		s_1.tab({
			id:		'general',
			caption:	L.tr('General Settings')
		});

		s_1.taboption('general', L.cbi.CheckboxValue, 'disabled', {
			caption:	L.tr('Disabled')
		});

		s_1.taboption('general', L.cbi.ListValue, 'mode', {
			caption:	L.tr('Mode'),
			initial:	'ap'
		})
		.value('ap', L.tr('Access Point'))
		.value('sta', L.tr('Client'))
		.value('adhoc', L.tr('Ad-Hoc'))
		.value('wds', L.tr('WDS (Wireless Distribution System)'))
		.value('monitor', L.tr('Monitor'))
		.value('mesh', L.tr('Mesh'));

		s_1.taboption('general', L.cbi.InputValue, 'ssid', {
			caption:	'SSID'
		});

		s_1.tab({
			id:		'security',
			caption:	L.tr('Security')
		});

		s_1.taboption('security', L.cbi.ListValue, 'encryption', {
			caption:	L.tr('Encryption'),
			initial:	'none'
		})
		.value('none', L.tr('No encryption'))
		.value('psk', L.tr('WPA Personal (PSK)'))
		.value('psk2', L.tr('WPA2 Personal (PSK)'))
		.value('mixed-psk', L.tr('WPA/WPA2 Personal (PSK) mixed'));

		s_1.taboption('security', L.cbi.PasswordValue, 'key', {
			caption:	L.tr('Passphrase'),
			optional:	true
		});

		return m.insertInto('#map');
	}
});
