const { compareSync } = require('bcrypt');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('./models/user-model');


passport.use(new LocalStrategy(
  function (username, password, done) {
    console.log('hit passport')
    User.findOne({ username: username }, (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      if (!compareSync(password, user.password)) { //When password is invalid
        return done(null, false, { message: 'Incorrect password.' });
      }
      console.log(user, 'is authed');
      return done(null, user); //When user is valid
    });
  }
));

//Persists user data inside session
passport.serializeUser(function (user, done) {
  console.log('serializing')
  done(null, user.id);
});

//Fetches session details using session id
passport.deserializeUser(function (id, done) {
  console.log('deserializing')
  User.findById(id, function (err, user) {
    done(err, user);
  });
});