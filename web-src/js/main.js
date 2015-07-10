var $ = require('jquery');
var _ = require('lodash');
require('jquery-editable');

var riot = require('riot');
var RiotControl = require('riotcontrol');
var DashboardStore = require('./dashboard-store');
var dashboardStore = new DashboardStore();
RiotControl.addStore(dashboardStore);

var loginModal = require('./tags/login-modal.tag');
var loginModal = require('./tags/header.tag');


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

  console.log(target);

  if (target === 'login') {
    RiotControl.trigger('login_open');
  }
});

var pageInit = function() {

  riot.mount('login-modal');
  riot.mount('header');
  riot.route('login');

};

$(document).ready(pageInit);
