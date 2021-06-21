const express = require('express');

const router = express.Router();

// Helper Functions
const {
  hashPassword,
  authMiddleware,
  comparePasswords
} = require('../helpers');

// MongoDB Models
const User = require('../models/User');

// Routes
router
  .route('/')
  /**
   * Get All Users
   *
   * @return {array} User Objects
   */
  .get((req, res) => {
    User.find()
      .then((users) => {
        let userArray = users.map((user) => {
          return { name: user.name, _id: user._id };
        });
        res.json(userArray);
      })
      .catch((err) => console.log(err));
  })
  /**
   * Create new User
   *
   * @param {string} name user name
   * @param {string} password user password
   * @param {number} access 0-2 permission level
   *
   * @return {object} User Object
   */
  .post(authMiddleware(0), async (req, res) => {
    let { name, password, access } = req.body;

    // Check if Name Doesn't Exist
    if (!name) {
      return res.status(401).json({
        errors: [{ message: 'Name is required' }]
      });
    }

    // Check if Access Level Doesn't Exist
    if (!access) {
      return res.status(401).json({
        errors: [{ message: 'Access Level Required' }]
      });
    }

    // Check if Password Doesn't Exist or is Less than 5 Characters
    if (!password || password.length < 5) {
      return res.status(401).json({
        errors: [{ message: 'Password Must Be 5 Characters Long' }]
      });
    }

    // Create User Object
    const NewUser = new User({ name, access });

    // Hash User Password
    NewUser.password = await hashPassword(password);

    // Save User
    NewUser.save()
      .then((User) => {
        res.json(User);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({
          message: 'Invalid Request'
        });
      });
  });

router
  .route('/:id')
  /**
   * Get Single User
   *
   * @param {string} id user id
   *
   * @return {object} User Object
   */
  .get(authMiddleware(0), (req, res) => {
    let { id } = req.body;
    User.findById(id)
      .then((user) => {
        res.json(user);
      })
      .catch((err) => console.log(err));
  })
  /**
   * Delete Single User
   *
   * @param {string} id user id
   *
   * @return {boolean} Success/ Error
   */
  .delete(authMiddleware(0), async (req, res) => {
    let user = await User.findOne({ _id: req.params.id });

    if (user) {
      user.remove();
      return res.json({ success: true });
    } else {
      return res.status(404).json({ errors: [{ message: 'No User Found' }] });
    }
  });

router
  .route('/:id/Password')
  /**
   * Change User Password
   *
   * @param {string} id user id
   * @param {string} current_password User Current Password
   * @param {string} new_password_1 User New Password
   * @param {string} new_password_2 User New Password Match
   *
   * @return {boolean} Success/ Error
   */
  .post(authMiddleware(), async (req, res) => {
    // Check if Requester is the User
    // Or if Requester is Admin Level
    if (req.auth.user._id !== req.params.id && req.auth.access !== 0) {
      return res.status(403).json({ errors: [{ message: 'Forbidden' }] });
    }

    let { current_password, new_password_1, new_password_2 } = req.body;

    let user = await User.findById(req.params.id);

    // If No User Found
    if (!user) {
      return res.status(404).json({ errors: [{ message: 'No User Found' }] });
    }

    // Unless Admin
    if (req.auth.access !== 0) {
      // Verify Current Password
      const isMatch = await comparePasswords(current_password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ errors: [{ message: 'Incorrect Password' }] });
      }
    }

    // Verify new passwords match
    if (new_password_1 !== new_password_2) {
      return res
        .status(400)
        .json({ errors: [{ message: 'Passwords Do Not Match' }] });
    }

    // Salt and Hash password
    user.password = await hashPassword(new_password_1);

    user
      .save()
      .then((user) => {
        res.send('Success');
      })
      .catch((err) => {
        res.status(500).json({ errors: [{ message: 'Database Error' }] });
      });
  });

router
  .route('/:id/Name')
  /**
   * Change User Name
   *
   * @param {string} id user id
   * @param {string} name user name
   * @param {string} username user username
   *
   * @return {boolean} Success/ Error
   */
  .post(authMiddleware(), async (req, res) => {
    // Check if Requester is the User
    // Or if Requester is Admin Level
    if (req.auth.user._id !== req.params.id && req.auth.access !== 0) {
      return res.status(403).json({ errors: [{ message: 'Forbidden' }] });
    }

    let user = await User.findById(req.params.id);

    // If No User Found
    if (!user) {
      res.status(404).json({ errors: [{ message: 'No User Found' }] });
    }

    user.name = req.body.name;
    user.username = req.body.username;

    user
      .save()
      .then((user) => {
        res.send('Success');
      })
      .catch((err) => {
        res.status(500).json({ errors: [{ message: 'Database Error' }] });
      });
  });

module.exports = router;
