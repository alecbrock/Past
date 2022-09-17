const router = require('express').Router();
const verify = require('../routes/verifyToken');
const { User } = require('../models/user-model');
var lifxObj = require('../lifx-helper');
var lifx = new lifxObj("c35ba47dc300ca3e18e0259d3ea85928200c775aa724d9a23972fff34da0cce9");


router.post('/toggle', verify, async (req, res) => {
  const user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  let selectedUser = user.name === req.body.username ? user.lifxID :
    await User.findOne({ 'name': req.body.username });
  if (!selectedUser) return res.status(400).send({ msg: 'Trouble finding selected user information' })
  if (typeof selectedUser !== "string") {
    selectedUser = selectedUser.lifxID;
  }

  lifx.togglePower(`id:${selectedUser}`, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })

    res.send(data);
  })
})

router.post('/color', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  let selectedUser = user.name === req.body.username ? user.lifxID :
    await User.findOne({ 'name': req.body.username });

  if (!selectedUser) return res.status(400).send({ msg: 'Trouble finding selected user information' })
  if (typeof selectedUser !== "string") {
    selectedUser = selectedUser.lifxID;
  }


  if (selectedUser === user.lifxID) {
    if (user.recentColors.length >= 10) {
      user.recentColors.shift()
    }
    user.recentColors.push(req.body.color)
    const result = await User.updateOne({ '_id': req.user._id }, { recentColors: user.recentColors });
    if (!result) return res.status(400).send({ msg: 'Trouble updating user' });
  }

  lifx.setState(`id:${selectedUser}`, { color: req.body.color }, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })
    res.send({recentColors: user.recentColors})
  })
})

router.post('/brightness', verify, async (req, res) => {
  const user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  let selectedUser = user.name === req.body.username ? user.lifxID :
    await User.findOne({ 'name': req.body.username });
  if (!selectedUser) return res.status(400).send({ msg: 'Trouble finding selected user information' })
  if (typeof selectedUser !== "string") {
    selectedUser = selectedUser.lifxID;
  }
  const formatBrightness = req.body.brightness / 100;

  lifx.setState(`id:${selectedUser}`, { brightness: formatBrightness }, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })

    res.send(data)
  })
})

router.post('/dash_color', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  lifx.setState(`id:${user.lifxID}`, { color: req.body.color }, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })

    res.send(data)
  })
});

router.post('/dash_kelvin', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  lifx.setState(`id:${user.lifxID}`, { color: `kelvin:${req.body.kelvin}` }, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })

    res.send(data)
  })
});

router.post('/activate_scene', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  const updatedBrightnessScene = {
    color: req.body.scene.color,
    brightness: req.body.scene.brightness/100
  }
  lifx.setState(`id:${user.lifxID}`, updatedBrightnessScene, (err, data) => {
    if (err) return res.status(400).send({ msg: 'Issue connecting to lifx' })
    res.send(data)
  })
})

router.post('/state', async (req, res) => {
  lifx.listLights(`id:${req.body.lifxID}`, (err, data) => {
    if(err) return res.status(400).send({msg: 'Could not find lifx state'})
    let parsed = JSON.parse(data);
    res.send({color: parsed[0].color, power: parsed[0].power, brightness: parsed[0].brightness})
  })
})


module.exports = router;


