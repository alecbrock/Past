const express = require('express');
const app = express();
const axios = require('axios');
const { User } = require('./models/user-model');
const authRoutes = require('./routes/authRoutes');
const verify = require('./routes/verifyToken');
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());
const dotenv = require('dotenv');
dotenv.config()

const connection = require('./database/index');

app.use(express.json());
app.use('/auth', authRoutes);

app.get('/', verify, (req, res) => {
  res.send('verified on all fronts')
});


app.listen(3002, () => {
  console.log('listening on port 3002')
});