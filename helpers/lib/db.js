require('dotenv').config();

const mongoose = require('mongoose');

module.exports = {
  async connectDB() {
    let DB;
    DB = process.env.MONGO_URI;
    return new Promise((resolve, reject) => {
      mongoose
        .connect(DB, {
          useNewUrlParser: true,
          useCreateIndex: true,
          useFindAndModify: false,
          useUnifiedTopology: true
        })
        .then(async () => {
          resolve('MongoDB Connected');
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }
};
