const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communityScenesSchema = new Schema({
  username: {
    type: String
  },
  name: {
    type: String
  },
  color: {
    type: String
  },
  brightness: {
    type: Number
  },
  effect: {
    type: Schema.Types.Mixed
  }
});

const CommunityScenes = mongoose.model("communityScenes", communityScenesSchema);

module.exports = { CommunityScenes };