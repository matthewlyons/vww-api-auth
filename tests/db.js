const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createAdmin, hashPassword } = require('../helpers');

const User = require('../models/User');

const mongod = new MongoMemoryServer();

module.exports = {
  async connect() {
    const uri = await mongod.getUri();
    const mongooseOpts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      poolSize: 10
    };
    mongoose.connect(uri, mongooseOpts).then(async () => {
      let admin = {
        username: 'Admin',
        name: 'Admin',
        access: 0
      };
      const AdminUser = new User(admin);
      AdminUser.password = await hashPassword('Default');
      await AdminUser.save();
    });
  },
  async closeDatabase() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  },
  async clearDatabase() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  },
  async loginUser() {
    console.log('Running');
  }
};
