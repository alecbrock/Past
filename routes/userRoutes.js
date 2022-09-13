const router = require('express').Router();
const { User } = require('../models/user-model');
const verify = require('../routes/verifyToken');

//want to add a friending system in future
//user searches for other username
//request comes in here and before simply adding username to user doc
//need to add the user to other user pending friend request in doc
//now when other user logs in they will see this pending friend request
//once they go to accept the request will come in here
//then will add that use to both people friends field
//then will delete the pending friend request in the other users document
//this will protect from somone simply adding you and being able to connect to your light

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

  const searchedUser = await User.findOne({ 'name': req.body.searchedUsername })
  if (!searchedUser) return res.status(400).send({ msg: 'Trouble finding searched user' })

  user.friends.push(req.body.searchedUsername);
  const updatedUser = await User.updateOne({ '_id': req.user._id }, { friends: user.friends })
  if (!updatedUser) res.status(400).send({ msg: 'Trouble adding friend' })

  const revisedUser = {recentColors: user.recentColors, name: user.name, friends: user.friends};
  res.send(revisedUser)
});


module.exports = router;