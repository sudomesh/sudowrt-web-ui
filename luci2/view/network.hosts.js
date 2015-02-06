L.ui.view.extend({
	title: L.tr('Hostnames'),
	description: L.tr('Manage static host records to let the local DNS server resolve certain names to specific IP addresses.'),

	execute: function() {
		var m = new L.cbi.Map('dhcp', {
			readonly:    !this.options.acls.hostnames
		});

		var s = m.section(L.cbi.TableSection, 'domain', {
			anonymous:   true,
			addremove:   true,
			add_caption: L.tr('Add new hostname'),
			remove_caption: L.tr('Remove hostname')
		});

		s.option(L.cbi.InputValue, 'name', {
			caption:     L.tr('Hostname'),
			datatype:    'hostname'
		});

		s.option(L.cbi.InputValue, 'ip', {
			caption:     L.tr('IP address'),
			datatype:    'ipaddr'
		});

		return m.insertInto('#map');
	}
});
