const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoginAttemptSchema = new Schema({
  username: {
    type: String
  },
  date: {
    type: Date,
    expires: 3600,
    default: Date.now
  }
});

module.exports = LoginAttempt = mongoose.model(
  'loginAttempt',
  LoginAttemptSchema
);
