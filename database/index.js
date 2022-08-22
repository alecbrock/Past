const mongoose = require('mongoose');



mongoose.connect(process.env.DB_CONNECT, {
  useNewUrlParser: true
});

const connection = mongoose.connection;

connection.on('error', function () { console.log('mongoose connection error') });
connection.once('open', function () { console.log('mongoose connected successfully')});



module.exports = { connection };