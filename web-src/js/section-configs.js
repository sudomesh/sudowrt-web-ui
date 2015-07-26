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
        format: 'string',
        slug: 'private-ssid'
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
        format: 'string',
        slug: 'shared-bw-down',
      },
      {
        section: 'tunneldigger',
        labelTitle: 'Shared Upload Speed Limit',
        matchType: 'interface',
        match: 'l2tp0',
        toChange: 'limit_bw_up',
        format: 'string',
        slug: 'shared-bw-up',
      }
    ]
  }
}
