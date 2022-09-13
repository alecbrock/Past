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
  }
});

const User = mongoose.model("user", userSchema);

module.exports = { User };