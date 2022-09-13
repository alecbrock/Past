const router = require('express').Router();
const axios = require('axios');
const { User } = require('../models/user-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validation');
const verify = require('../routes/verifyToken');

router.post('/register', async (req, res) => {
  console.log(req.body);
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message, unlogged: true })

  const userExist = await User.findOne({ email: req.body.email })
  if (userExist) return res.status(400).send({ msg: 'Email already exists', unlogged: true })

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);


  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    lifxID: '',
    friends: [req.body.name],
    recentColors: []
  })

  try {
    const savedUser = await user.save();
    res.send({ user: user._id });
  } catch (err) {
    res.status(400).send({ msg: err, unlogged: true });
  }
});

router.post('/login', async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message, unlogged: true })

  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).send({ msg: 'Email does not exists', unlogged: true })

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send({ msg: 'Invalid password', unlogged: true })

  const token = jwt.sign({ _id: user._id }, process.env.TOKEN, { expiresIn: '300 min' })

  res
    .header('Access-Control-Expose-Headers', 'auth-token')
    .header('auth-token', token)
    .send(token)
});

router.post('/checkAuth', verify, async (req, res) => {
  const user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  const revisedUser = {recentColors: user.recentColors, name: user.name, friends: user.friends};
  res.send(revisedUser)
});


module.exports = router;