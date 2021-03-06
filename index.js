const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/user', require('./routes/user'));

app.get('/*', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;
