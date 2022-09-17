const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1000
  },
  lifxID: {
    type: String
  },
  friends: {
    type: Array
  },
  recentColors: {
    type: Array
  },
  pendingFriends: {
    type: Array
  },
  profileColor: {
    type: String
  },
  scenes: {
    type: Object
  }
});

const User = mongoose.model("user", userSchema);

module.exports = { User };