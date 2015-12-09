module.exports = {
  wireless: {
    title: 'Wireless',
    uciConfigs: [
      {
        section: 'wireless',
        labelTitle: 'Private SSID',
        matchType: 'ifname',
        match: 'priv0',
        toChange: 'ssid',
        format: 'text',
        slug: 'private-ssid'
      },
      {
        section: 'wireless',
        labelTitle: 'Private Wifi Password',
        matchType: 'ifname',
        match: 'priv0',
        toChange: 'key',
        format: 'text',
        slug: 'private-password'
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
