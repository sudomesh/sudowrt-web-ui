module.exports = {
  wireless: {
    title: 'Wireless',
    uciConfigs: [
      {
        section: 'wireless',
        labelTitle: 'Private SSID 2.4ghz',
        matchType: 'ifname',
        match: 'priv2',
        toChange: 'ssid',
        format: 'text',
        slug: 'private-ssid-2'
      },
      {
        section: 'wireless',
        labelTitle: 'Private Wifi Password 2.4ghz',
        matchType: 'ifname',
        match: 'priv2',
        toChange: 'key',
        format: 'text',
        slug: 'private-password-2'
      },
      {
        section: 'wireless',
        labelTitle: 'Private SSID 5ghz',
        matchType: 'ifname',
        match: 'priv5',
        toChange: 'ssid',
        format: 'text',
        slug: 'private-ssid-5'
      },
      {
        section: 'wireless',
        labelTitle: 'Private Wifi Password 5ghz',
        matchType: 'ifname',
        match: 'priv5',
        toChange: 'key',
        format: 'text',
        slug: 'private-password-5'
      }
    ]
  },
  tunneldigger: {
    title: 'Bandwidth Sharing',
    uciConfigs: [
      {
        section: 'tunneldigger',
        labelTitle: 'Shared Download Speed Limit',
        matchType: 'interface',
        match: 'l2tp0',
        toChange: 'limit_bw_down',
        format: 'text',
        slug: 'shared-bw-down',
      },
      {
        section: 'tunneldigger',
        labelTitle: 'Shared Upload Speed Limit',
        matchType: 'interface',
        match: 'l2tp0',
        toChange: 'limit_bw_up',
        format: 'text',
        slug: 'shared-bw-up',
      }
    ]
  }
}
