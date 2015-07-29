Class.extend({
	listDeviceNames: L.rpc.declare({
		object: 'iwinfo',
		method: 'devices',
		expect: { 'devices': [ ] },
		filter: function(data) {
			data.sort();
			return data;
		}
	}),

	getDeviceStatus: L.rpc.declare({
		object: 'iwinfo',
		method: 'info',
		params: [ 'device' ],
		expect: { '': { } },
		filter: function(data, params) {
			if (!$.isEmptyObject(data))
			{
				data['device'] = params['device'];
				return data;
			}
			return undefined;
		}
	}),

	getAssocList: L.rpc.declare({
		object: 'iwinfo',
		method: 'assoclist',
		params: [ 'device' ],
		expect: { results: [ ] },
		filter: function(data, params) {
			for (var i = 0; i < data.length; i++)
				data[i]['device'] = params['device'];

			data.sort(function(a, b) {
				if (a.bssid < b.bssid)
					return -1;
				else if (a.bssid > b.bssid)
					return 1;
				else
					return 0;
			});

			return data;
		}
	}),

	getWirelessStatus: function() {
		return this.listDeviceNames().then(function(names) {
			L.rpc.batch();

			for (var i = 0; i < names.length; i++)
				L.wireless.getDeviceStatus(names[i]);

			return L.rpc.flush();
		}).then(function(networks) {
			var rv = { };

			var phy_attrs = [
				'country', 'channel', 'frequency', 'frequency_offset',
				'txpower', 'txpower_offset', 'hwmodes', 'hardware', 'phy'
			];

			var net_attrs = [
				'ssid', 'bssid', 'mode', 'quality', 'quality_max',
				'signal', 'noise', 'bitrate', 'encryption'
			];

			for (var i = 0; i < networks.length; i++)
			{
				var phy = rv[networks[i].phy] || (
					rv[networks[i].phy] = { networks: [ ] }
				);

				var net = {
					device: networks[i].device
				};

				for (var j = 0; j < phy_attrs.length; j++)
					phy[phy_attrs[j]] = networks[i][phy_attrs[j]];

				for (var j = 0; j < net_attrs.length; j++)
					net[net_attrs[j]] = networks[i][net_attrs[j]];

				phy.networks.push(net);
			}

			return rv;
		});
	},

	getAssocLists: function()
	{
		return this.listDeviceNames().then(function(names) {
			L.rpc.batch();

			for (var i = 0; i < names.length; i++)
				L.wireless.getAssocList(names[i]);

			return L.rpc.flush();
		}).then(function(assoclists) {
			var rv = [ ];

			for (var i = 0; i < assoclists.length; i++)
				for (var j = 0; j < assoclists[i].length; j++)
					rv.push(assoclists[i][j]);

			return rv;
		});
	},

	formatEncryption: function(enc)
	{
		var format_list = function(l, s)
		{
			var rv = [ ];
			for (var i = 0; i < l.length; i++)
				rv.push(l[i].toUpperCase());
			return rv.join(s ? s : ', ');
		}

		if (!enc || !enc.enabled)
			return L.tr('None');

		if (enc.wep)
		{
			if (enc.wep.length == 2)
				return L.tr('WEP Open/Shared') + ' (%s)'.format(format_list(enc.ciphers, ', '));
			else if (enc.wep[0] == 'shared')
				return L.tr('WEP Shared Auth') + ' (%s)'.format(format_list(enc.ciphers, ', '));
			else
				return L.tr('WEP Open System') + ' (%s)'.format(format_list(enc.ciphers, ', '));
		}
		else if (enc.wpa)
		{
			if (enc.wpa.length == 2)
				return L.tr('mixed WPA/WPA2') + ' %s (%s)'.format(
					format_list(enc.authentication, '/'),
					format_list(enc.ciphers, ', ')
				);
			else if (enc.wpa[0] == 2)
				return 'WPA2 %s (%s)'.format(
					format_list(enc.authentication, '/'),
					format_list(enc.ciphers, ', ')
				);
			else
				return 'WPA %s (%s)'.format(
					format_list(enc.authentication, '/'),
					format_list(enc.ciphers, ', ')
				);
		}

		return L.tr('Unknown');
	}
});
