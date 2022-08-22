const jwt = require('jsonwebtoken');

module.exports = function auth(req,res,next) {
  const token = req.header('auth-token');
  if(!token) { return res.status(400).send({msg: 'Access denied', unlogged: true}) }

  console.log(token)
  try {
    const verified = jwt.verify(token, process.env.TOKEN)
    req.user = verified;
    next();
  } catch(err) {
    res.status(400).send({msg: 'Invalid token', unlogged: true})
  }
}