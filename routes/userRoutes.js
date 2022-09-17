const router = require('express').Router();
const { User } = require('../models/user-model');
const verify = require('../routes/verifyToken');

//create route


router.get('/username', verify, async (req, res) => {
  const user = await User.findOne({ '_id': req.user._id })
  if (!user) return res.status(400).send({ msg: 'Trouble finding user' })

  res.send({ username: user.name })
})

router.post('/lifxID', verify, async (req, res) => {
  User.updateOne({ '_id': req.user._id }, { lifxID: req.body.lifxID }, (err, docs) => {
    if (err) return res.status(400).send({ msg: 'Unable to save lifxID' });

    res.send(docs);
  })
})

router.post('/search_user', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  for (let i = 0; i < user.friends.length; i++) {
    if (user.friends[i] === req.body.searchedUsername) {
      return res.status(400).send({ msg: 'User is already your friend' })
    }
  }

  const searchedUser = await User.findOne({ 'name': req.body.searchedUsername })
  if (!searchedUser) return res.status(400).send({ msg: 'Trouble finding searched user' })

  searchedUser.pendingFriends.push(user.name);
  const updatedUser = await User.updateOne({ 'name': req.body.searchedUsername }, { pendingFriends: searchedUser.pendingFriends })
  if (!updatedUser) return res.status(400).send({ msg: 'Trouble requesting friend invite' })

  res.send('good to go')
});

router.post('/add_friend', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  const friend = await User.findOne({ 'name': req.body.friend });
  if (!friend) return res.status(400).send({ msg: 'Trouble finding friend' })

  user.friends.push(req.body.friend);
  let updatedPending = user.pendingFriends.filter((val) => val !== req.body.friend);
  user.pendingFriends = updatedPending;
  friend.friends.push(user.name);

  const updatedUser = await User.updateOne({ '_id': req.user._id }, { $set: { friends: user.friends, pendingFriends: user.pendingFriends } });
  if (!updatedUser) return res.status(400).send({ msg: 'Trouble adding friend' })

  const updatedFriend = await User.updateOne({ "name": req.body.friend }, { friends: friend.friends });
  if (!updatedFriend) return res.status(400).send({ msg: "Trouble adding you to users friend list" })

  res.send({friends: user.friends, pendingFriends: user.pendingFriends});
})

router.post('/remove_friend', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  const friend = await User.findOne({ 'name': req.body.friend });
  if (!friend) return res.status(400).send({ msg: 'Trouble finding friend' })

  let userFriendList = user.friends.filter((val) => val !== req.body.friend);
  let friendsFriendList = friend.friends.filter((val) => val !== user.name);
  user.friends = userFriendList;

  const updatedUser = await User.updateOne({ '_id': req.user._id }, { friends: userFriendList });
  if (!updatedUser) return res.status(400).send({ msg: 'Trouble adding friend' })

  const updatedFriend = await User.updateOne({ "name": req.body.friend }, { friends: friendsFriendList });
  if (!updatedFriend) return res.status(400).send({ msg: "Trouble adding you to users friend list" })

  res.send({friends: user.friends, pendingFriends: user.pendingFriends})
})

router.post('/profile_color', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  user.profileColor = req.body.color;

  const updatedUser = await User.updateOne({ '_id': req.user._id }, { profileColor: user.profileColor });
  if (!updatedUser) return res.status(400).send({ msg: 'Trouble updating profile color' })

  res.send({profileColor: user.profileColor})
})

router.post('/add_scene', verify, async (req, res) => {
  let key = Object.keys(req.body)[0];
  if(!key.length) return res.status(400).send({msg: 'Scene needs a name'})

  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  if(!req.body[key].color) return res.status(400).send({msg: 'Scene needs a color'})

  if(Object.keys(user.scenes).length >= 6) return res.status(400).send({msg: 'Maximum amount of scenes'})
  if(user.scenes[key]) return res.status(400).send({msg: 'Scene name is already being used'})

  user.scenes[key] = req.body[key];

  const updatedUser = await User.updateOne({ '_id': req.user._id }, { scenes: user.scenes });
  if (!updatedUser) return res.status(400).send({ msg: 'Trouble adding scene' })

  // const revisedUser = { recentColors: user.recentColors, name: user.name, friends: user.friends, pendingFriends: user.pendingFriends, profileColor: user.profileColor, scenes: user.scenes };
  res.send({scenes: user.scenes})

})

router.post('/remove_scene', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  delete user.scenes[req.body.sceneName];

  const updatedUser = await User.updateOne({ '_id': req.user._id }, { scenes: user.scenes });
  if (!updatedUser) return res.status(400).send({ msg: 'Trouble removing scene' })

  res.send({scenes: user.scenes})
})

module.exports = router;