const express = require('express');
const app = express();
const axios = require('axios');
const { User } = require('./models/user-model');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const lifxRoutes = require('./routes/lifxRoutes');
const communityRoutes = require('./routes/communityRoutes');
const verify = require('./routes/verifyToken');
const cors = require('cors');
const bodyParser = require('body-parser')
// const sdk = require('api')('https://api.developer.lifx.com/openapi/63053fd59807941f67a92dcb')
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
var lifxObj = require('lifx-api');
var lifx = new lifxObj("c35ba47dc300ca3e18e0259d3ea85928200c775aa724d9a23972fff34da0cce9");
const port = process.env.PORT || 3002;
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['https://present-rust.vercel.app','http://localhost:3000']
}));

const dotenv = require('dotenv');
dotenv.config()

const connection = require('./database/index');

app.use(express.json());
// app.use(bodyParser.json());l
// app.use(bodyParser.urlencoded({ extended: true }));llllll
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/lifx', lifxRoutes);
app.use('/community', communityRoutes);

app.get('/', (req, res) => {
  res.send('verified on all fronts')
});

app.get('/try', (req, res) => {
      console.log('hey');
      res.send('good')
})


app.listen(port, () => {
  console.log('listening on port 3002')
});