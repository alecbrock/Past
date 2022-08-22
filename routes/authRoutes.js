const router = require('express').Router();
const axios = require('axios');
const { User } = require('../models/user-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validation');

router.post('/register', async (req, res) => {

  const { error } = registerValidation(req.body);
  if (error) { return res.status(400).send({ msg: error.details[0].message, unlogged: true }) }

  const userExist = await User.findOne({ email: req.body.email })
  if (userExist) { return res.status(400).send({ msg: 'Email already exists', unlogged: true }) }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);


  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
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
  if (error) { return res.status(400).send({ msg: error.details[0].message, unlogged: true }) }

  const user = await User.findOne({ email: req.body.email })
  if (!user) { return res.status(400).send({ msg: 'Email does not exists', unlogged: true }) }

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) { return res.status(400).send({ msg: 'Invalid password', unlogged: true }) }

  const token = jwt.sign({ _id: user._id }, process.env.TOKEN, { expiresIn: '1 min' })
  res.header('auth-token', token).send(token)
})


module.exports = router;