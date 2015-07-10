var $ = require('jquery');
var _ = require('lodash');
var getSlug = require('speakingurl');

var riot = require('riot');
var RiotControl = require('riotcontrol');
var DashboardStore = require('./dashboard-store');
var dashboardStore = new DashboardStore();
RiotControl.addStore(dashboardStore);

var loginModal = require('./tags/login-modal.tag');
var header = require('./tags/header.tag');
var inputSettings = require('./tags/input-settings.tag');

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

  if (target === 'settings') {
    var testSettings = [
    {
      name: 'Upload Speed Limit',
      type: 'number',
      units: 'Mbps'
    },
    {
      name: 'Download Speed Limit',
      type: 'number',
      units: 'kbps'
    }
    ];
    _.each(testSettings, function(setting) {
      setting.slug = getSlug(setting.name);
    });
    RiotControl.trigger('settings_changed', testSettings);
  }
});

var pageInit = function() {
  riot.mount('login-modal');
  riot.mount('header');
  riot.mount('input-settings');
  riot.route('login');

};

$(document).ready(pageInit);
