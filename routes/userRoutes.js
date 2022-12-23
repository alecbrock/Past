const router = require('express').Router();
const { User } = require('../models/user-model');
const { CommunityScenes } = require('../models/communityScenes-model');
const verify = require('../routes/verifyToken');
const axios = require('axios');
//create route
//need to add if no lifxid error

router.get('/username', verify, async (req, res) => {
  const user = await User.findOne({ '_id': req.user._id })
  if (!user) return res.status(400).send({ msg: 'Trouble finding user' })

  res.send({ username: user.name })
})

router.post('/lifxID', verify, async (req, res) => {
  User.updateOne({ '_id': req.user._id }, { $set: { lifxID: req.body.lifxID, accessToken: req.body.accessToken } }, (err, docs) => {
    if (err) return res.status(400).send({ msg: 'Unable to save lifxID and access token' });

    res.send(docs);
  })
})

router.post('/search_user', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })
//
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

  res.send({ friends: user.friends, pendingFriends: user.pendingFriends });
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

  res.send({ friends: user.friends, pendingFriends: user.pendingFriends })
})

router.post('/profile_color', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  user.profileColor = req.body.color;

  const updatedUser = await User.updateOne({ '_id': req.user._id }, { profileColor: user.profileColor });
  if (!updatedUser) return res.status(400).send({ msg: 'Trouble updating profile color' })

  res.send({ profileColor: user.profileColor })
})

router.post('/add_scene', verify, async (req, res) => {
  let key = Object.keys(req.body)[0];
  if (!key.length) return res.status(400).send({ msg: 'Scene needs a name' })
console.log(req.body)
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  if (!req.body[key].color) return res.status(400).send({ msg: 'Scene needs a color' })

  if (Object.keys(user.scenes).length >= 6) return res.status(400).send({ msg: 'Maximum amount of scenes' })
  if (user.scenes[key]) return res.status(400).send({ msg: 'Scene name is already being used' })

  user.scenes[key] = req.body[key];

  const updatedUser = await User.updateOne({ '_id': req.user._id }, { scenes: user.scenes });
  if (!updatedUser) return res.status(400).send({ msg: 'Trouble adding scene' })

  // const revisedUser = { recentColors: user.recentColors, name: user.name, friends: user.friends, pendingFriends: user.pendingFriends, profileColor: user.profileColor, scenes: user.scenes };
  res.send({ scenes: user.scenes })

})

router.post('/remove_scene', verify, async (req, res) => {
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })

  delete user.scenes[req.body.sceneName];

  const updatedUser = await User.updateOne({ '_id': req.user._id }, { scenes: user.scenes });
  if (!updatedUser) return res.status(400).send({ msg: 'Trouble removing scene' })

  res.send({ scenes: user.scenes })
})

router.post('/share_scene', verify, async (req, res) => {
  console.log(req.body);
  const { name, color, brightness, effect } = req.body;
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })
  if(!req.body.name) return res.status(400).send({msg: 'Scene needs a name'})

  const communityScene = new CommunityScenes({
    username: user.name,
    name: name,
    color: color,
    brightness: brightness,
    effect: effect ? effect : false
  });

  const result = await communityScene.save();
  if(!result) return res.status(400).send({msg: 'Trouble saving scene'})
  //share if not already shared
  //check collection for existing by name
  const communityPages = await axios.post('http://localhost:3002/community/community_page', {pageNumber: 1, nPerPage: 12});
  if(!communityPages) return res.status(400).send({msg: 'Trouble fetching community scenes'});
  res.send(communityPages.data);
  //send the updated community scenes in here
})

// router.post('/cancel_effect', verify, async (req, res) => {
//   let userToExit = await User.findOne({name: req.body.username});
//   if(req.body.effectName === 'Candle' || req.body.effectName === 'Cycle') {
//     await User.updateOne({ name: req.body.username }, { exitEffect: userToExit.exitEffect === null ? false : true });
//   } else {
//     await lifx.cancelEffect(user.accessToken, `id:${user.lifxID}`, (err, data) => {
//       if(err) return res.status(400).send({msg: 'Trouble canceling effect'})
//     })
//   }
//   res.end();
// })

//in users dashboard will be their scenes with an option to share that scene on each card
  //up clicking share scene

//need a route for share scene
  //in request will be the scene
  //will add scene to the communityScenes collection

//in community component
  //will call authPost and get everything including first page of community scenes
  //will need pagination so every time page switch will send page number and return the appropriate scenes
  //will be able to search scenes and upon enter of button or pressing enter only scenes with that name will appear
    //maybe do it so that you can search by username and scene name
  //also need pagination with searched scenes just incase it spands multiple pages long

//need to figure out how to go back to normal community scenes
  //when search is empty then switch back to normal
  //so will need two arrays in redux

//upon clicking a scene will
  //send all data for that scene to activate scene route
  //scenes also need ability to deactivate effects
  //upon click of scene will highlight scene in white
  //then if clicked again will stop effect
    //maybe store current color and brightness to go back to





module.exports = router;