const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

// MongoDB Models
const User = require('../models/User');
const LoginAttempt = require('../models/LoginAttempt');

// Helper Functions
const {
  timeUntilMidnight,
  authMiddleware,
  createToken
} = require('../helpers');

// Routes
router
  .route('/login')
  /**
   * User Login Route
   *
   * @param {string} name user name
   * @param {string} password user password
   *
   * @return {object<user: User Object, token: User Auth Token, exp: Auth Token Expiration Time>}
   */
  .post(async (req, res) => {
    let { username, password } = req.body;

    // Check username and password were included in req
    if (!username || !password) {
      return res
        .status(404)
        .json({ errors: [{ message: 'Missing Username or Password' }] });
    }

    // Security Check for Brute Force
    let recentAttempts = await LoginAttempt.find({ username });
    if (recentAttempts.length > 5) {
      return res
        .status(401)
        .json({ errors: [{ message: 'Too Many Login Attempts' }] });
    }
    // Save Attempt for Brute Force Check
    let attempt = new LoginAttempt({ username });
    attempt.save();

    let user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ errors: [{ message: 'Username or Password Incorrect' }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ errors: [{ message: 'Username or Password Incorrect' }] });
    }

    let [countdown, midnight] = timeUntilMidnight();

    const payload = {
      user: {
        _id: user._id
      }
    };

    createToken(payload, countdown)
      .then((token) => {
        res.json({
          user: { _id: user._id, name: user.name, access: user.access },
          token,
          exp: midnight
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(404).json({ errors: [{ message: 'No User Found' }] });
      });
  });

router
  .route('/token')
  /**
   * Check Token Against Required Access Level
   *
   * @header {string} Bearer Token
   * @param {string} accessLevel Required Access Level
   *
   * @return {object} Validated or Error
   */
  .post(authMiddleware(), async (req, res) => {
    res.json({ validated: true });
  });

module.exports = router;
