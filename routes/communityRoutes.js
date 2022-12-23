const router = require('express').Router();
const { CommunityScenes } = require('../models/communityScenes-model');
const { User } = require('../models/user-model');
const verify = require('../routes/verifyToken');

router.post('/community_page', async (req, res) => {
  const { pageNumber, nPerPage, name } = req.body;
  console.log(pageNumber, nPerPage);
  const page = await CommunityScenes.find(name ? {name} : {})
    .sort({ _id: -1 })
    .skip(pageNumber > 0 ? ((pageNumber - 1) * nPerPage) : 0)
    .limit(nPerPage);

  if (!page) return res.status(400).send({ msg: 'Trouble finding community pages' })
  res.send(page);
})

router.post('/find_community_scenes', async (req, res) => {
  const { pageNumber, nPerPage, name } = req.body;
  console.log(name)

  const page = await CommunityScenes.find({
    $or: [
      {name: name},
      {username: name}
    ]
  }).sort({ _id: -1 })
    .skip(pageNumber > 0 ? ((pageNumber - 1) * nPerPage) : 0)
    .limit(nPerPage);

if (!page) return res.status(400).send({ msg: 'Trouble finding community pages' })
res.send(page);
})

router.post('/share_scene', verify, async (req, res) => {
  const { name, color, brightness, effect } = req.body;
  let user = await User.findOne({ '_id': req.user._id });
  if (!user) return res.status(400).send({ msg: 'Trouble finding user information' })
  if (!req.body.name) return res.status(400).send({ msg: 'Scene needs a name' })

  const alreadyExist = await CommunityScenes.findOne({name, color, brightness, effect});
  if(alreadyExist) return res.status(400).send({msg: 'Scene already exists'})

  const communityScene = new CommunityScenes({
    username: user.name,
    name: name,
    color: color,
    brightness: brightness,
    effect: effect ? effect : false
  });

  const result = await communityScene.save();
  if (!result) return res.status(400).send({ msg: 'Trouble saving scene' })
  //share if not already shared
  //check collection for existing by name


  const page = await CommunityScenes.find()
    .sort({ _id: -1 })
    .skip(1 > 0 ? ((1 - 1) * 12) : 0)
    .limit(12);

  if (!page) return res.status(400).send({ msg: 'Trouble finding community pages' })
  res.send(page);
})

module.exports = router;