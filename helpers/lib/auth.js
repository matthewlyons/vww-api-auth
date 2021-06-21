require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');

module.exports = {
  authMiddleware(access) {
    return async function (req, res, next) {
      try {
        let authLevel = access || req.body.accessLevel;
        let authHeader = req.headers['authorization'];
        let authToken = authHeader && authHeader.split(' ')[1];
        if (!authToken) {
          return res.status(401).json({
            errors: [{ message: 'Unauthorized | Auth Token Required' }]
          });
        }

        let response = jwt.verify(authToken, process.env.API_SECRET);
        let { _id } = response.user;
        let user = await User.findById(_id);
        if (!authLevel) {
          req.auth = { ...response, access: user.access };
          next();
        }

        if (user.access > authLevel) {
          return res
            .status(401)
            .json({ errors: [{ message: 'Unauthorized' }] });
        } else {
          req.user = response.user._id;
          next();
        }
      } catch (error) {
        return res.status(401).json({ errors: [{ message: 'Unauthorized' }] });
      }
    };
  },
  async checkAdmin() {
    let users = await User.find();
    if (users.length === 0) {
      await module.exports.createAdmin();
    }
  },
  async createAdmin() {
    let admin = {
      username: 'Admin',
      name: 'Admin',
      access: 0
    };
    const AdminUser = new User(admin);
    AdminUser.password = await module.exports.hashPassword('Default');
    await AdminUser.save()
      .then((User) => {
        console.log('Created Admin');
      })
      .catch((err) => {
        console.log('Failed To Create Admin');
      });
  },
  async hashPassword(password) {
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(password, salt);
    return hash;
  },
  async comparePasswords(str1, str2) {
    const isMatch = await bcrypt.compare(str1, str2);
    return isMatch;
  },
  async createToken(payload, exp) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        process.env.API_SECRET,
        {
          expiresIn: exp
        },
        (err, token) => {
          if (err) {
            reject(err);
          }
          resolve(token);
        }
      );
    });
  }
};
