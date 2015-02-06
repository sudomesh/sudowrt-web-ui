Class.extend({
	getZoneColor: function(zone)
	{
		if ($.isPlainObject(zone))
			zone = zone.name;

		if (zone == 'lan')
			return '#90f090';
		else if (zone == 'wan')
			return '#f09090';

		for (var i = 0, hash = 0;
			 i < zone.length;
			 hash = zone.charCodeAt(i++) + ((hash << 5) - hash));

		for (var i = 0, color = '#';
			 i < 3;
			 color += ('00' + ((hash >> i++ * 8) & 0xFF).tostring(16)).slice(-2));

		return color;
	},

	findZoneByNetwork: function(network)
	{
		var self = this;
		var zone = undefined;

		return L.uci.sections('firewall', 'zone', function(z) {
			if (!z.name || !z.network)
				return;

			if (!$.isArray(z.network))
				z.network = z.network.split(/\s+/);

			for (var i = 0; i < z.network.length; i++)
			{
				if (z.network[i] == network)
				{
					zone = z;
					break;
				}
			}
		}).then(function() {
			if (zone)
				zone.color = self.getZoneColor(zone);

			return zone;
		});
	}
});
