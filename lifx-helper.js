var request = require('request');

function lifx(accessToken) {
  this.accessToken = accessToken;
}

lifx.prototype.listLights = function (selector, cb) {
  var url = 'https://' + this.accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector;

  sendRequest(url, "GET", null, function (err, res, body) {
    if (err) return cb(err, null)
    cb(null, body);
  });
}



lifx.prototype.togglePower = function (selector, cb) {
  var url = 'https://' + this.accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector + '/toggle';

  sendRequest(url, "POST", null, function (err, res, body) {
    if (err) return cb(err, null)
    cb(null, body);
  });
}



lifx.prototype.setPower = function (selector, _state, _duration, cb) {
  var url = 'https://' + this.accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector + '/power';

  if (typeof _state == "undefined") _state = "on";
  if (typeof _duration == "undefined") _duration = "1.0";

  sendRequest(url, "PUT", { state: _state, duration: _duration }, function (err, res, body) {
    if (err) return cb(err, null)
    cb(null, body);
  });
}



lifx.prototype.setState = function (selector, obj, cb) {
  var url = 'https://' + this.accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector + '/state';

  sendRequest(url, "PUT", obj, function (err, res, body) {
    if (err) return cb(err, null)
    cb(null, body);
  });
}



lifx.prototype.breatheEffect = function (selector, _color, _from_color, _period, _cycles, _persist, _power_on, _peak, cb) {
  var url = 'https://' + this.accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector + '/effects/breathe';

  if (typeof _color == "undefined") _color = "red";
  if (typeof _from_color == "undefined") _from_color = "blue";
  if (typeof _period == "undefined") _period = 1.0;
  if (typeof _cycles == "undefined") _cycles = 1.0;
  if (typeof _persist == "undefined") _persist = false;
  if (typeof _power_on == "undefined") _power_on = true
  if (typeof _peak == "undefined") _peak = 1.0;

  sendRequest(url, "POST", { color: _color, from_color: _from_color, period: _period, cycles: _cycles, persist: _persist, power_on: _power_on, peak: _peak }, function (err, res, body) {
    if (err) return cb(err, null)
    cb(null, body);
  });
}



lifx.prototype.pulseEffect = function (selector, _color, _from_color, _period, _cycles, _persist, _power_on, _duty_cycle, cb) {
  var url = 'https://' + this.accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector + '/effects/breathe';
  if (typeof _color == "undefined") _color = "red";
  if (typeof _from_color == "undefined") _from_color = "blue";
  if (typeof _period == "undefined") _period = 1.0;
  if (typeof _cycles == "undefined") _cycles = 1.0;
  if (typeof _persist == "undefined") _persist = false;
  if (typeof _power_on == "undefined") _power_on = true
  if (typeof _duty_cycle == "undefined") _duty_cycle = 1.0;

  sendRequest(url, "POST", { color: _color, from_color: _from_color, period: _period, cycles: _cycles, persist: _persist, power_on: _power_on, duty_cycle: _duty_cycle }, function (err, res, body) {
    if (err) return cb(err, null)
    cb(null, body);
  });
}



//--------------Private Functions----------------

function sendRequest(_url, _method, _data, _cb) {
  request({ url: _url, method: _method, form: _data }, function (error, response, body) {
    _cb(error, response, body);
  });

}


module.exports = lifx;


