const router = require('express').Router();
const verify = require('../routes/verifyToken');
const { User } = require('../models/user-model');
const axios = require('axios');
var lifxObj = require('../lifx-helper');
var lifx = new lifxObj();



router.post('/toggle', verify, async (req, res) => {
  const user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })
  if (!user.lifxID) return res.status(400).send({ msg: 'Must set lifx ID' })

  let selectedUser = user.name === req.body.username ? { lifxID: user.lifxID, accessToken: user.accessToken } :
    await User.findOne({ 'name': req.body.username });
  if (!selectedUser) return res.status(400).send({ msg: 'Trouble finding selected user information' })
  if (Object.keys(selectedUser).length !== 2) {
    selectedUser = { lifxID: selectedUser.lifxID, accessToken: selectedUser.accessToken };
  }

  lifx.togglePower(selectedUser.accessToken, `id:${selectedUser.lifxID}`, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })

    res.send(data);
  })
})

router.post('/color', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })
  if (!user.lifxID) return res.status(400).send({ msg: 'Must set lifx ID' })

  let selectedUser = user.name === req.body.username ? { lifxID: user.lifxID, accessToken: user.accessToken } :
    await User.findOne({ 'name': req.body.username });
  if (!selectedUser) return res.status(400).send({ msg: 'Trouble finding selected user information' })
  if (Object.keys(selectedUser).length !== 2) {
    selectedUser = { lifxID: selectedUser.lifxID, accessToken: selectedUser.accessToken };
  }


  if (selectedUser.lifxID === user.lifxID) {
    if (user.recentColors.length >= 10) {
      user.recentColors.shift()
    }
    user.recentColors.push(req.body.color)
    const result = await User.updateOne({ '_id': req.user._id }, { recentColors: user.recentColors });
    if (!result) return res.status(400).send({ msg: 'Trouble updating user' });
  }

  lifx.setState(selectedUser.accessToken, `id:${selectedUser.lifxID}`, { color: req.body.color, brightness: req.body.brightness ? req.body.brightness / 100 : 1.0 }, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })
    res.send({ recentColors: user.recentColors })
  })
})

router.post('/brightness', verify, async (req, res) => {
  const user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })
  if (!user.lifxID) return res.status(400).send({ msg: 'Must set lifx ID' })

  let selectedUser = user.name === req.body.username ? { lifxID: user.lifxID, accessToken: user.accessToken } :
    await User.findOne({ 'name': req.body.username });
  if (!selectedUser) return res.status(400).send({ msg: 'Trouble finding selected user information' })
  if (Object.keys(selectedUser).length !== 2) {
    selectedUser = { lifxID: selectedUser.lifxID, accessToken: selectedUser.accessToken };
  }

  const formatBrightness = req.body.brightness / 100;

  lifx.setState(selectedUser.accessToken, `id:${selectedUser.lifxID}`, { brightness: formatBrightness }, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })

    res.send(data)
  })
})

router.post('/dash_color', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })
  if (!user.lifxID) return res.status(400).send({ msg: 'Must set lifx ID' })

  lifx.setState(user.accessToken, `id:${user.lifxID}`, { color: req.body.color }, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })

    res.send(data)
  })
});

router.post('/dash_kelvin', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })
  if (!user.lifxID) return res.status(400).send({ msg: 'Must set lifx ID' })

  lifx.setState(user.accessToken, `id:${user.lifxID}`, { color: `kelvin:${req.body.kelvin}` }, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })

    res.send(data)
  })
});

router.post('/activate_scene', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })
  if (!user.lifxID) return res.status(400).send({ msg: 'Must set lifx ID' })

  const updatedBrightnessScene = {
    color: req.body.scene.color,
    brightness: req.body.scene.brightness / 100
  };

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }


  lifx.setState(user.accessToken, `id:${user.lifxID}`, updatedBrightnessScene, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })
  })



  if (!req.body.scene.effect) return res.end();
  // console.log('after color and brightness');
  await sleep(1000);
  // const { color, fromColor, period, cycles, intensity, colorArray, name } = req.body.scene.effect;

  // if (name === "Breathe") {
  //   lifx.breatheEffect(user.accessToken, `id:${user.lifxID}`, color, fromColor, period, cycles, undefined, undefined, undefined, (err, data) => {
  //     if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })
  //   })
  // } else if (name === "Pulse") {
  //   lifx.pulseEffect(user.accessToken, `id:${user.lifxID}`, color, fromColor, period, cycles, undefined, undefined, (err, data) => {
  //     console.log(err, 'THIS IS ERROR MESSAGE FOR PULSE')
  //     console.log(data, 'THIS IS DATA FROM PULSE')
  //     if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })
  //   })
  // } else if (name === "Candle") {
  //   console.log(err, 'THIS IS ERROR MESSAGE FOR CANDLE')
  //   lifx.candleEffect(user.accessToken, `id:${user.lifxID}`, intensity / 10, cycles, (err, data) => {
  //     if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })
  //   })
  // } else {
  //   lifx.colorCycle(user.accessToken, `id:${user.lifxID}`, colorArray, period, cycles, undefined, undefined, undefined, (err, data) => {
  //     if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })
  //   })
  // }

  // const effectResult =
  // axios.post(`http://localhost:3002/lifx/candle_effect`, {
  //   color: req.body.scene.effect.color,
  //   fromColor: req.body.scene.effect.fromColor,
  //   period: req.body.scene.effect.period,
  //   cycles: req.body.scene.effect.cycles,
  //   intensity: req.body.scene.effect.intensity,
  //   colorArray: req.body.scene.effect.colorArray,
  //   username: user.name
  // }).then((data) => {
  //   console.log(data)
  // }).catch((error) => {
  //   console.log(error)
  // })

  // if (!effectResult) return res.status(400).send({ msg: 'Error starting effect' });
  // res.end()

})

//need to consider making a new route for cancelling effects
//need route for paginating through community scenes
//need to route for searched community scenes


router.post('/state', async (req, res) => {
  lifx.listLights(req.body.accessToken, `id:${req.body.lifxID}`, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Could not find lifx state' })
    let parsed = JSON.parse(data);
    res.send({ color: parsed[0].color, power: parsed[0].power, brightness: parsed[0].brightness })
  })
})

router.post('/breathe_effect', verify, async (req, res) => {
  const { color, fromColor, period, cycles } = req.body;

  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })
  if (!user.lifxID) return res.status(400).send({ msg: 'Must set lifx ID' })

  let selectedUser = user.name === req.body.username ? { lifxID: user.lifxID, accessToken: user.accessToken } :
    await User.findOne({ 'name': req.body.username });
  if (!selectedUser) return res.status(400).send({ msg: 'Trouble finding selected user information' })
  if (Object.keys(selectedUser).length !== 2) {
    selectedUser = { lifxID: selectedUser.lifxID, accessToken: selectedUser.accessToken };
  }
  lifx.breatheEffect(selectedUser.accessToken, `id:${selectedUser.lifxID}`, color, fromColor, period, cycles, undefined, undefined, undefined, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })
    console.log('hit', data)
    res.send(data)
  })
})

//needs a from and too
//otherwise effect will switch from the same color to same color
//breathe and pulse do not turn off light and turn on but switches between colors


router.post('/pulse_effect', verify, async (req, res) => {
  const { color, fromColor, period, cycles } = req.body
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })
  if (!user.lifxID) return res.status(400).send({ msg: 'Must set lifx ID' })

  let selectedUser = user.name === req.body.username ? { lifxID: user.lifxID, accessToken: user.accessToken } :
    await User.findOne({ 'name': req.body.username });
  if (!selectedUser) return res.status(400).send({ msg: 'Trouble finding selected user information' })
  if (Object.keys(selectedUser).length !== 2) {
    selectedUser = { lifxID: selectedUser.lifxID, accessToken: selectedUser.accessToken };
  }

  lifx.pulseEffect(selectedUser.accessToken, `id:${selectedUser.lifxID}`, color, fromColor, period, cycles, undefined, undefined, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })
    console.log('hit', color, period, cycles)

    res.send(data)
  })
})

router.post('/candle_effect', verify, async (req, res) => {
  console.log(req.body, 'hello')
  const { intensity, cycles } = req.body
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })
  if (!user.lifxID) return res.status(400).send({ msg: 'Must set lifx ID' })

  let selectedUser = user.name === req.body.username ? { lifxID: user.lifxID, accessToken: user.accessToken } :
    await User.findOne({ 'name': req.body.username });
  if (!selectedUser) return res.status(400).send({ msg: 'Trouble finding selected user information' })
  if (Object.keys(selectedUser).length !== 2) {
    selectedUser = { lifxID: selectedUser.lifxID, accessToken: selectedUser.accessToken };
  }

  // if (exit) {
  //   let userToExit = await User.findOne({name: req.body.username});
  //   await User.updateOne({ name: req.body.username }, { exitEffect: userToExit.exitEffect === null ? false : true });
  //   return res.send('canceled effect');
  // }

  await lifx.candleEffect(selectedUser.accessToken, `id:${selectedUser.lifxID}`, intensity / 10, cycles, (err, data) => {
    console.log(req.user)
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })
    console.log('hit', data);

    res.send(data)
  })
})

router.post('/cycle_effect', verify, async (req, res) => {
  const { colorArray, period, cycles } = req.body
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' });
  if (!user.lifxID) return res.status(400).send({ msg: 'Must set lifx ID' });

  let selectedUser = user.name === req.body.username ? { lifxID: user.lifxID, accessToken: user.accessToken } :
    await User.findOne({ 'name': req.body.username });
  if (!selectedUser) return res.status(400).send({ msg: 'Trouble finding selected user information' })
  if (Object.keys(selectedUser).length !== 2) {
    selectedUser = { lifxID: selectedUser.lifxID, accessToken: selectedUser.accessToken };
  }

  // if (exit) {
  //   let userToExit = await User.findOne({name: req.body.username});
  //   await User.updateOne({ name: req.body.username }, { exitEffect: userToExit.exitEffect === null ? false : true });
  //   return res.send('canceled effect');
  // }


  await lifx.colorCycle(selectedUser.accessToken, `id:${selectedUser.lifxID}`, colorArray, period, cycles, undefined, undefined, undefined, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })
    console.log('hit', data);

    res.send(data)
  })
})

router.post('/cancel_effect', verify, async (req, res) => {
  console.log('hit on cancel effect')
  let userToExit = await User.findOne({ name: req.body.username });
  if (req.body.effectName === 'Candle' || req.body.effectName === 'Cycle') {
    await User.updateOne({ name: req.body.username }, { exitEffect: userToExit.exitEffect === null ? false : true });
  } else {
    await lifx.cancelEffect(userToExit.accessToken, `id:${userToExit.lifxID}`, (err, data) => {
      if (err) return res.status(400).send({ msg: 'Trouble canceling effect' })
    })
  }
  res.end();
})

//possible issue with effects that constantly hit lifxl
//if say candle effect is in motion
//and we switch to cycle effect and start it
//then we will have two effect going because we havent cancelled the last effect

module.exports = router;


