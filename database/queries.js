const { User } = require('../models/user-model');
var ObjectID = require('mongodb').ObjectID;
const { connection } = require('./index')

const findAndUpdateUser = (obj) => {
  const { filter, update } = obj;

  return new Promise((resolve, reject) => {
    connection.db.collection('users').updateOne(filter, { $set: update }, (error, status) => {
      if (error) {
        reject(error);
      } else {
        resolve(status);
      }
    })
  })
};

const findOneByUserId = (id) => {
  return new Promise((resolve, reject) => {
    connection.db.collection('users').findOne({ "_id": ObjectID(id) }, (error, doc) => {
      if (doc) {
        resolve(doc);
      } else {
        reject(error);
      }
    })
  })
};


module.exports = { findAndUpdateUser, findOneByUserId };