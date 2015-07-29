L.ui.view.extend({
	title: L.tr('Status'),

	getConntrackCount: L.rpc.declare({
		object: 'luci2.network',
		method: 'conntrack_count',
		expect: { '': { count: 0, limit: 0 } }
	}),

	getDHCPLeases: L.rpc.declare({
		object: 'luci2.network',
		method: 'dhcp_leases',
		expect: { leases: [ ] }
	}),

	getDHCPv6Leases: L.rpc.declare({
		object: 'luci2.network',
		method: 'dhcp6_leases',
		expect: { leases: [ ] }
	}),

	renderContents: function() {
		var self = this;
		return $.when(
			L.network.refreshStatus().then(function() {
				var wan  = L.network.findWAN();
				var wan6 = L.network.findWAN6();

				if (!wan && !wan6)
				{
					$('#network_status_table').empty();
					return;
				}

				var networkTable = new L.ui.table({
					caption: L.tr('Network'),
					columns: [ {
						width:  '146px',
						format: '%s'
					}, {
						width:  '146px',
						align:  'right',
						format: function(v) {
							var dev = L.network.resolveAlias(v.getDevice());
							if (dev)
								return $('<span />')
									.addClass('badge')
									.attr('title', dev.description())
									.append($('<img />').attr('src', dev.icon()))
									.append(' %s'.format(dev.name()));

							return '';
						}
					}, {
						format: function(v, n) {
							var s = '<strong>' + L.tr('Type') + ':</strong> %s | ' +
							        '<strong>' + L.tr('Connected') + ':</strong> %t<br />';

							s = s.format(v.getProtocol().description, v.getUptime(),
							             n ? v.getIPv6Addrs(true).join(', ')
							               : v.getIPv4Addrs(true).join(', '));

							var addr = n ? v.getIPv6Addrs() : v.getIPv4Addrs();
							if (addr.length)
								s += '<strong>' + L.tr('Address') + ':</strong> %s<br />'.format(addr.join(', '));

							var gw = v.getIPv4Gateway();
							if (gw)
								s += '<strong>' + L.tr('Gateway') + ':</strong> %s<br />'.format(gw);

							var dns = n ? v.getIPv6DNS() : v.getIPv4DNS();
							if (dns.length)
								s += '<strong>' + L.tr('DNS') + ':</strong> %s<br />'.format(dns.join(', '));

							return s;
						}
					} ]
				});

				if (wan)
					networkTable.row([ L.tr('IPv4 WAN Status'), wan, wan ]);

				if (wan6)
					networkTable.row([ L.tr('IPv6 WAN Status'), wan6, wan6 ]);

				networkTable.insertInto('#network_status_table');
			}),
			self.getConntrackCount().then(function(count) {
				var conntrackTable = new L.ui.table({
					caption: L.tr('Connection Tracking'),
					columns: [ {
						width: '300px'
					}, {
						format: function(v) {
							return new L.ui.progress({
								value:  v.count,
								max:    v.limit,
								format: '%d / %d (%d%%)'
							}).render();
						}
					} ]
				});

				conntrackTable.row([ L.tr('Active Connections'), count ]);
				conntrackTable.insertInto('#conntrack_status_table');
			}),
			L.system.getInfo().then(function(info) {
				var sysinfoTable = new L.ui.table({
					caption: L.tr('System'),
					columns: [ { width: '300px' }, { } ]
				});

				sysinfoTable.rows([
					[ L.tr('Hostname'),         info.hostname                         ],
					[ L.tr('Model'),            info.model                            ],
					[ L.tr('Firmware Version'), info.release.description              ],
					[ L.tr('Kernel Version'),   info.kernel                           ],
					[ L.tr('Local Time'),       (new Date(info.localtime * 1000)).toString() ],
					[ L.tr('Uptime'),           '%t'.format(info.uptime)              ],
					[ L.tr('Load Average'),
					  '%.2f %.2f %.2f'.format(
						  info.load[0] / 65535.0,
						  info.load[1] / 65535.0,
						  info.load[2] / 65535.0
					  ) ]
				]);

				sysinfoTable.insertInto('#system_status_table');

				var memoryTable = new L.ui.table({
					caption: L.tr('Memory'),
					columns: [ {
						format: '%s',
						width:  '300px'
					}, {
						format: function(v) {
							return new L.ui.progress({
								value:  v,
								max:    info.memory.total,
								format: function(pc) {
									return ('%d ' + L.tr('kB') + ' / %d ' + L.tr('kB') + ' (%d%%)').format(
										v / 1024, info.memory.total / 1024, pc
									);
								}
							}).toString();
						}
					} ]
				});

				memoryTable.rows([
					[ L.tr('Total Available'), info.memory.free + info.memory.buffered ],
					[ L.tr('Free'),            info.memory.free                        ],
					[ L.tr('Cached'),          info.memory.shared                      ],
					[ L.tr('Buffered'),        info.memory.buffered                    ],
				]);

				memoryTable.insertInto('#memory_status_table');

				if (info.swap.total > 0)
				{
					var swapTable = new L.ui.table({
						caption: L.tr('Swap'),
						columns: [ {
							format: '%s',
							width:  '300px'
						}, {
							format: function(v) {
								return new L.ui.progress({
									value:  v,
									max:    info.swap.total,
									format: function(pc) {
										return ('%d ' + L.tr('kB') + ' / %d ' + L.tr('kB') + ' (%d%%)').format(
											v / 1024, info.swap.total / 1024, pc
										);
									}
								}).toString();
							}
						} ]
					});

					swapTable.row([ L.tr('Free'), info.swap.free ]);
					swapTable.insertInto('#swap_status_table');
				}

				var diskTable = new L.ui.table({
					caption: L.tr('Storage'),
					columns: [ {
						format: '%s',
						width:  '300px'
					}, {
						format: function(v) {
							return new L.ui.progress({
								value:  v[0],
								max:    v[1],
								format: function(pc) {
									return ('%d ' + L.tr('kB') + ' / %d ' + L.tr('kB') + ' (%d%%)').format(
										v[0] / 1024, v[1] / 1024, pc
									);
								}
							}).toString();
						}
					} ]
				});

				diskTable.row([ '' + L.tr('Root Usage') + ' (/)', [ info.root.used, info.root.total ] ]);
				diskTable.row([ '' + L.tr('Temporary Usage') + ' (/tmp)', [ info.tmp.used, info.tmp.total ] ]);
				diskTable.insertInto('#disk_status_table');
			}),
			L.wireless.getWirelessStatus().then(function(radios) {
				var phys = [ ];
				for (var phy in radios)
					phys.push(phy);

				phys.sort();

				$('#wifi_status_table').empty();

				for (var i = 0; i < phys.length; i++)
				{
					var rows = [ ];
					var radio = radios[phys[i]];

					rows.push([false, {
						name: radio.hardware
							? '%s 802.11%s (%s)'.format(
								radio.hardware.name, radio.hwmodes.join(''),
								radio.phy.replace(/^[^0-9]+/, 'radio'))
							: ('802.11%s ' + L.tr('Radio') + ' (%s)').format(
								radio.hwmodes.join(''),
								radio.phy.replace(/^[^0-9]+/, 'radio')),
						channel:   radio.channel,
						frequency: radio.frequency,
						txpower:   radio.txpower
					}]);

					for (var j = 0; j < radio.networks.length; j++)
					{
						var network = radio.networks[j];

						if (network.bssid && network.bssid != '00:00:00:00:00:00' && radio.channel)
							rows[0][0] = true;

						rows.push([{
							signal:      network.signal,
							noise:       network.noise,
							device:      network.device
						}, {
							ssid:        network.ssid,
							bssid:       network.bssid,
							mode:        network.mode,
							encryption:  network.encryption,
							bitrate:     network.bitrate
						}]);
					}

					var wifiTable = new L.ui.table({
						caption: i ? null : L.tr('Wireless'),
						columns: [ {
							width:  '34px',
							align:  'right',
							format: function(v, n)
							{
								if (typeof(v) != 'boolean')
								{
									return new L.ui.devicebadge(v).render();
								}
								else
								{
									var img = document.createElement('img');
										img.src = L.globals.resource + '/icons/wifi_big' + (v ? '' : '_disabled') + '.png';

									return img;
								}
							}
						}, {
							format: function(v, n)
							{
								if (typeof(rows[n][0]) != 'boolean')
								{
									var s = '<strong>' + L.tr('Mode') + ':</strong> %s | ' +
									        '<strong>' + L.tr('Bitrate') + ':</strong> %s | ' +
									        '<strong>' + L.tr('SSID') + ':</strong> %s<br />' +
											'<strong>' + L.tr('BSSID') + ':</strong> %s | ' +
											'<strong>' + L.tr('Encryption') + ':</strong> %s';

									return s.format(
										v.mode, v.bitrate ? ('~ %.1f ' + L.tr('Mbit/s')).format(v.bitrate / 1000) : '?',
										v.ssid, v.bssid, L.wireless.formatEncryption(v.encryption)
									);
								}
								else
								{
									var s = '<big><strong>%s</strong></big><br />' +
											'<strong>' + L.tr('Channel') + ':</strong> %d (%.3f ' + L.tr('GHz') + ') | ' +
											'<strong>' + L.tr('TX Power') + ':</strong> %d ' + L.tr('dBm') + '';

									return s.format(
										v.name,
										v.channel, v.frequency / 1000,
										v.txpower
									);
								}
							}
						} ]
					});

					wifiTable.rows(rows);
					$('#wifi_status_table').append(wifiTable.render());
				}
			}),
			L.wireless.getAssocLists().then(function(assoclist) {
				var formatRate = function(v)
				{
					return (typeof v.mcs != 'undefined')
						? ('%.1f ' + L.tr('Mbit/s') + ', MCS %d, %d%s').format(v.rate / 1000, v.mcs, v['40mhz'] ? 40 : 20, L.tr('MHz'))
						: ('%.1f ' + L.tr('Mbit/s')).format(v.rate / 1000);
				};

				var assocTable = new L.ui.table({
					caption:     L.tr('Associated Stations'),
					placeholder: L.tr('No information available'),
					columns:     [ {
						format:  function(v, n) {
							return new L.ui.devicebadge(assoclist[n]).render();
						},
						width:   '34px',
						align:   'right',
						key:     'signal'
					}, {
						caption: L.tr('MAC-Address'),
						key:     'mac'
					}, {
						caption: L.tr('Signal'),
						format:  '%d ' + L.tr('dBm') + '',
						key:     'signal'
					}, {
						caption: L.tr('Noise'),
						format:  '%d ' + L.tr('dBm') + '',
						key:     'noise'
					}, {
						caption: L.tr('RX Rate'),
						format:  formatRate,
						key:     'rx'
					}, {
						caption: L.tr('TX Rate'),
						format:  formatRate,
						key:     'tx'
					} ]
				});

				assocTable.rows(assoclist);
				assocTable.insertInto('#wifi_assoc_table');
			}),
			self.getDHCPLeases().then(function(leases) {
				var leaseTable = new L.ui.table({
					caption:     L.tr('DHCP Leases'),
					placeholder: L.tr('There are no active leases.'),
					columns: [ {
						caption:     L.tr('Hostname'),
						placeholder: '?',
						key:         'hostname'
					}, {
						caption:     L.tr('IPv4-Address'),
						key:         'ipaddr'
					}, {
						caption:     L.tr('MAC-Address'),
						key:         'macaddr'
					}, {
						caption:     L.tr('Leasetime remaining'),
						key:         'expires',
						format:      function(v) {
							return (v <= 0) ? L.tr('expired') : '%t'.format(v);
						}
					} ]
				});

				leaseTable.rows(leases);
				leaseTable.insertInto('#lease_status_table');
			}),
			self.getDHCPv6Leases().then(function(leases) {
				if (!leases.length)
					return;

				var leaseTable = new L.ui.table({
					caption:     L.tr('DHCPv6 Leases'),
					columns: [ {
						caption:     L.tr('Hostname'),
						placeholder: '?',
						key:         'hostname'
					}, {
						caption:     L.tr('IPv6-Address'),
						key:         'ip6addr'
					}, {
						caption:     L.tr('DUID'),
						key:         'duid'
					}, {
						caption:     L.tr('Leasetime remaining'),
						key:         'expires',
						format:      function(v) {
							return (v <= 0) ? L.tr('expired') : '%t'.format(v);
						}
					} ]
				});

				leaseTable.rows(leases);
				leaseTable.insertInto('#lease6_status_table');
			})
		)
	},

	execute: function()
	{
		var self = this;
        return L.network.load().then(function() {
			self.repeat(self.renderContents, 5000);
        });
	}
});
