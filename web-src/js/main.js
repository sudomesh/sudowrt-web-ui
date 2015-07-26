var $ = require('jquery');
var _ = require('lodash');
var getSlug = require('speakingurl');
var sectionConfigs = require('./section-configs.js');

var riot = require('riot');
var RiotControl = require('riotcontrol');
var DashboardStore = require('./dashboard-store');
var dashboardStore = new DashboardStore();
RiotControl.addStore(dashboardStore);

var loginModal = require('./tags/login-modal.tag');
var header = require('./tags/header.tag');
var inputSettings = require('./tags/input-settings.tag');
var passwordChange = require('./tags/password-change.tag');

riot.route.parser(function(path) {
  var raw = path.split('?'),
      uri = raw[0].split('/'),
      qs = raw[1],
      params = {}

  if (qs) {
    qs.split('&').forEach(function(v) {
      var c = v.split('=')
      params[c[0]] = c[1]
    })
  }

  uri.push(params)
  return uri
});

riot.route(function(target, action, params) {
  if (target === 'login') {
    RiotControl.trigger('login_open');
  }
});

dashboardStore.on('uci_configs_changed', function(configs) {
  sections = [];
  console.log(configs);
  _.each(sectionConfigs, function(sectionConfig, sectionKey) {
    var section = {
      title: sectionConfig.title,
      uciInputs: []
    }
    _.each(configs, function(uciSetting, uciSettingKey) {
      _.each(sectionConfig.uciConfigs, function(uciConfig) {

        if (uciConfig.section === uciSettingKey) {

          // This is pretty inelegant - could be refactored:
          // need a findWithKey function
          _.each(uciSetting, function(setting, key) {
            if (setting[uciConfig.matchType] === uciConfig.match) {
              configEntry = setting;
              configEntryKey = key;
            }
          });

          if (typeof configEntry === 'object') {
            var uciSettingInput = uciConfig;
            uciSettingInput.value = configEntry[uciConfig.toChange];
            uciSettingInput.type = configEntry['.type'];
            uciSettingInput.key = configEntryKey;
            section.uciInputs.push(uciSettingInput);
          }
        }
      });
    });

    sections.push(section);
  });

  if (sections.length > 0) {
    RiotControl.trigger('sections_changed', sections);
  }
});

var pageInit = function() {
  riot.mount('login-modal');
  riot.mount('header');
  riot.mount('password-change');
  riot.mount('div#uci-settings', 'input-settings', { sectionName: 'uci' });
  riot.route('login');

};

$(document).ready(pageInit);
