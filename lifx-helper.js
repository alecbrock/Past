var request = require('request');
const { User } = require('./models/user-model');

function lifx() {
}

lifx.prototype.listLights = function (accessToken, selector, cb) {
  var url = 'https://' + accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector;

  sendRequest(url, "GET", null, function (err, res, body) {
    if (err) return cb(err, null)
    cb(null, body);
  });
}



lifx.prototype.togglePower = function (accessToken, selector, cb) {
  var url = 'https://' + accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector + '/toggle';

  sendRequest(url, "POST", null, function (err, res, body) {
    if (err) return cb(err, null)
    cb(null, body);
  });
}



lifx.prototype.setPower = function (accessToken, selector, _state, _duration, cb) {
  var url = 'https://' + accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector + '/power';

  if (typeof _state == "undefined") _state = "on";
  if (typeof _duration == "undefined") _duration = "1.0";

  sendRequest(url, "PUT", { state: _state, duration: _duration }, function (err, res, body) {
    if (err) return cb(err, null)
    cb(null, body);
  });
}



lifx.prototype.setState = function (accessToken, selector, obj, cb) {
  var url = 'https://' + accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector + '/state';

  sendRequest(url, "PUT", obj, function (err, res, body) {
    if (err) return cb(err, null)
    cb(null, body);
  });
}



lifx.prototype.breatheEffect = function (accessToken, selector, _color, _from_color, _period, _cycles, _persist, _power_on, _peak, cb) {
  var url = 'https://' + accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector + '/effects/breathe';

  if (typeof _color == "undefined") _color = "red";
  if (typeof _from_color == "undefined") _from_color = "blue";
  if (typeof _period == "undefined") _period = 1.0;
  if (typeof _cycles == "undefined") _cycles = 1.0;
  if (typeof _persist == "undefined") _persist = false;
  if (typeof _power_on == "undefined") _power_on = true
  if (typeof _peak == "undefined") _peak = 0.5;

  sendRequest(url, "POST", { color: _color, from_color: _from_color, period: _period, cycles: _cycles, persist: _persist, power_on: _power_on, peak: _peak }, function (err, res, body) {
    if (err) return cb(err, null)
    cb(null, body);
  });
}



lifx.prototype.pulseEffect = async function (accessToken, selector, _color, _from_color, _period, _cycles, _persist, _power_on, cb) {
  var url = 'https://' + accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector + '/effects/pulse';
  if (typeof _color == "undefined") _color = "red";
  if (typeof _from_color == "undefined") _from_color = "blue";
  if (typeof _period == "undefined") _period = 1.0;
  if (typeof _cycles == "undefined") _cycles = 1.0;
  if (typeof _persist == "undefined") _persist = false;
  if (typeof _power_on == "undefined") _power_on = true

  console.log({ color: _color, from_color: _from_color, period: _period, cycles: _cycles, persist: _persist, power_on: _power_on }, "THIS THE DATA GIVEN TO PULSE")
  await sendRequest(url, "POST", { color: _color, from_color: _from_color, period: _period, cycles: _cycles, persist: _persist, power_on: _power_on }, function (err, res, body) {
    console.log(err, 'THIS ERROR INSIDE LIFX PULSE')
    console.log(body, 'THIS IS THE BODY IN PULSE')
    console.log(res, 'THIS IS THE LIFX RESPONSE')
    if (err) return cb(err, null)
    cb(null, body);
  });
}

lifx.prototype.candleEffect = async function (accessToken, selector, _intensity, _cycles, cb) {
  cb(null, 'started effect')

  var url = 'https://' + accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector + '/state';
  let highOrLow = true;

  if (typeof _intensity === "undefined") _intensity = 5;
  if (typeof _cycles === "undefined") _cycles = 100000;


  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }


  const randomBrightness = (num) => {
    const arr = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    let max = 0;
    let min = 0;

    if (highOrLow) {
      max = 9;
      min = 7;
    } else {
      max = num < 3 ? 2 : num - 1;
      min = num < 3 ? 0 : num - 3;
    }
    return arr[Math.floor(Math.random() * (max - min + 1)) + min];
  }

  for (let i = 0; i < _cycles; i++) {
    console.log('hit in candle');
    let user = await User.findOne({ accessToken: accessToken });
    if (!user.exitEffect) {
      if (user.exitEffect === null) await User.updateOne({ accessToken: accessToken }, { exitEffect: false })
      let resultBrightness = randomBrightness(_intensity);

      if (resultBrightness <= 1.0 && resultBrightness >= 0.8 && highOrLow === true) {
        await sleep(Math.floor(Math.random() * (500 - 200 + 1)) + 200)
      } else {
        await sleep(Math.floor(Math.random() * (800 - 500 + 1)) + 500)
      }
      highOrLow = !highOrLow;

      await sendRequest(url, "PUT", { brightness: resultBrightness, fast: true }, function (err, res, body) { console.log(err, 'THIS ERROR INSIDE LIFX CANDLE') });

    } else {
      console.log('should not be in here');
      await sendRequest(url, "PUT", { brightness: 1.0, fast: true }, function (err, res, body) { });
      await User.updateOne({ accessToken: accessToken }, { exitEffect: false });
      return;
    }
  }
  await User.updateOne({ accessToken: accessToken }, { exitEffect: null });
}

lifx.prototype.colorCycle = async function (accessToken, selector, _color_array, _period, _cycles, _persist, _power_on, _peak, cb) {
  cb(null, 'started effect');

  var url = 'https://' + accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector + '/effects/breathe';

  if (typeof _color_array == "undefined") _color_array = ["red", "green", "blue"];
  if (typeof _period == "undefined") _period = 1.0;
  if (typeof _cycles == "undefined") _cycles = 100000;
  if (typeof _persist == "undefined") _persist = true;
  if (typeof _power_on == "undefined") _power_on = true
  if (typeof _peak == "undefined") _peak = 0.5;
  //see best peak for cycle trying out .5
  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }


  //color cycle will take in an array of colors a period and cycle
  //color array will be iterated over
  //period tell how long between iterations
  //so period will be set in the request to lifx
  //and also used as amount of time for sleep
  //so that it doesnt call breathe again before its done

  //cycles will be used for the second iterator
  //everytime on the last element of the color array
  //first iterator will be set back to 0
  for (let j = 0; j < _cycles; j++) {
    for (var i = 0; i < _color_array.length; i++) {
      let user = await User.findOne({ accessToken: accessToken });
      if (!user.exitEffect) {
        let fromColor = _color_array[i];
        let color = i === _color_array.length - 1 ? _color_array[0] : _color_array[i + 1];

        await sendRequest(url, "POST", { color: color, from_color: fromColor, period: _period, cycles: 1, persist: _persist, power_on: _power_on, peak: _peak }, function (err, res, body) {  });
        await sleep(_period * 1000 + 200);

      } else {
        await User.updateOne({ accessToken: accessToken }, { exitEffect: false });
        return 'canceled effect success';
      }
    }
    i = 0;
    //when the entire function is done set exitEffect to false
  }
  await User.updateOne({ accessToken: accessToken }, { exitEffect: null });
}

lifx.prototype.cancelEffect = function (accessToken, selector, cb) {
  var url = 'https://' + accessToken + ':' + '@api.lifx.com' + '/v1/lights/' + selector + '/effects/off';

  sendRequest(url, "POST", { power_off: false }, function (err, res, body) {
    if (err) return cb(err, null)
    cb(null, body);
  });
}


//on client side when try effect button is pressed then a boolean will be set to true
//if boolean is true and user presses try effect again then the user will be met with error
//stating must cancel previous effect before trying effect again
//the once cancel effect is pressed then will set boolean to false


//check to see if errors are passed through callback
//err is comming back as null

//flicker may be doable but will cost alot of api calls
//stroble can be done by using pulse and setting first colr to black and time set to low
//animate would have to allow a user to pick three or more colors and then use state delta to gradually switch
//color cycle may be able to use breathe set too one cycle and then each new color is a request

//--------------Private Functions----------------

function sendRequest(_url, _method, _data, _cb) {
  request({ url: _url, method: _method, form: _data }, function (error, response, body) {
    _cb(error, response, body);
  });

}


module.exports = lifx;


