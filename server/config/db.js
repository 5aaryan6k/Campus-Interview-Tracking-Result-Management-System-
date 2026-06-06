const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
  try {
    let url = process.env.MONGODB_URL;

    if (!url) {
      console.log('No MONGODB_URL found. Starting local in-memory MongoDB server...');
      mongoServer = await MongoMemoryServer.create();
      url = mongoServer.getUri();
      console.log(`In-memory MongoDB started at: ${url}`);
    }

    await mongoose.connect(url);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Database disconnected.');
  } catch (err) {
    console.error('Error disconnecting database:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
