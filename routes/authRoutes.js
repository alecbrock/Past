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
    accessToken: '',
    friends: [req.body.name],
    recentColors: [],
    pendingFriends: [],
    profileColor: '#5D3FD3',
    scenes: {default: {color: '#5D3FD3', brightness: 100.0}},
    exitEffect: false,
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

  const token = jwt.sign({ _id: user._id }, process.env.TOKEN, { expiresIn: '10000 min' })

  res
    .header('Access-Control-Expose-Headers', 'auth-token')
    .header('auth-token', token)
    .send(token)
});

router.post('/check_auth', verify, async (req, res) => {
  console.log('hit on auth check')
  //possibly check to see if user documents have changed somehow and send that down
  //by checking things out of users control like friends changing their profile color and lifx state changing
  //so upon authcheck will send what is in redux
  //in here will assert if both are equal and if not send down the new information so users dont have to refresh
  res.send('good to go')
})

router.post('/user_info', verify, async (req, res) => {
  console.log('hit on user info')
  let formattedFriendColors = [], formattedPendingColors = [];

  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  if(!user.lifxID) return res.send({
    colors: {},
    user: { recentColors: user.recentColors, name: user.name, friends: user.friends, pendingFriends: user.pendingFriends, profileColor: user.profileColor, scenes: user.scenes },
    state: {}
  })

  let friendColors = await User.find({ 'name': { $in: user.friends } });
  if (!friendColors) return res.status(400).send({ msg: 'Trouble finding friend proile colors' })
  let pendingFriendColors = await User.find({ 'name': { $in: user.pendingFriends } });
  if (!pendingFriendColors) return res.status(400).send({ msg: 'Trouble finding pending friend profile colors' });

  if (friendColors.length) {
    formattedFriendColors = friendColors.map((x) => ({ [`${x.name}`]: x.profileColor }))
  }

  if (pendingFriendColors.length) {
    formattedPendingColors = pendingFriendColors.map((x) => ({ [`${x.name}`]: x.profileColor }))
  }

  let resultState = await axios.post('https://past-alecbrock.vercel.app/lifx/state', { lifxID: user.lifxID, accessToken: user.accessToken })
  if (!resultState) return res.status(400).send({ msg: 'Could not find lifx state' })

  let resultCommunityScenes = await axios.post('https://past-alecbrock.vercel.app/community/community_page', {pageNumber: 1, nPerPage: 12})

  const result = {
    colors: formattedFriendColors.concat(formattedPendingColors).reduce(((r, c) => Object.assign(r, c)), {}),
    user: { recentColors: user.recentColors, name: user.name, friends: user.friends, pendingFriends: user.pendingFriends, profileColor: user.profileColor, scenes: user.scenes },
    state: resultState.data,
    communityScenes: resultCommunityScenes.data
  }
  res.send(result);
})

//nedd to send down first page of community scenes ^^^

// router.post('/checkAuth_color', verify, async (req, res) => {
//   let formattedFriendColors = [], formattedPendingColors = [];

//   let user = await User.findOne({ '_id': req.user._id });
//   if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

//   let friendColors = await User.find({ 'name': { $in: user.friends } });
//   if (!friendColors) return res.status(400).send({ msg: 'Trouble finding friend proile colors' })
//   let pendingFriendColors = await User.find({ 'name': { $in: user.pendingFriends } });
//   if (!pendingFriendColors) return res.status(400).send({ msg: 'Trouble finding pending friend profile colors' });

//   if (friendColors.length) {
//     formattedFriendColors = friendColors.map((x) => ({ [`${x.name}`]: x.profileColor }))
//   }

//   if (pendingFriendColors.length) {
//     formattedPendingColors = pendingFriendColors.map((x) => ({ [`${x.name}`]: x.profileColor }))
//   }

//   res.send(
//     {
//       colors: formattedFriendColors.concat(formattedPendingColors).reduce(((r, c) => Object.assign(r, c)), {}),
//       user: { recentColors: user.recentColors, name: user.name, friends: user.friends, pendingFriends: user.pendingFriends, profileColor: user.profileColor, scenes: user.scenes }
//     });
// })

module.exports = router;