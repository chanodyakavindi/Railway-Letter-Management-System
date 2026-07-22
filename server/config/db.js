const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let memoryServer = null;

function getPersistentMemoryDbPath() {
  const configuredPath = process.env.MEMORY_DB_PATH;
  const dbPath = configuredPath || path.join(__dirname, '..', '.memory-db', 'rlms');
  fs.mkdirSync(dbPath, { recursive: true });
  return dbPath;
}

const connectDB = async () => {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rlms';

  const connect = async (connectionUri) => {
    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 3000,
    });
  };

  if (process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbPath: getPersistentMemoryDbPath(),
        storageEngine: 'wiredTiger',
      },
    });
    uri = memoryServer.getUri('rlms');
    console.log('Using persistent MongoDB memory fallback for development');
    await connect(uri);
    console.log('MongoDB connected');
    return;
  }

  try {
    await connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    if (process.env.NODE_ENV === 'production') throw err;
    console.warn('Local MongoDB unavailable — falling back to in-memory database');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbPath: getPersistentMemoryDbPath(),
        storageEngine: 'wiredTiger',
      },
    });
    uri = memoryServer.getUri('rlms');
    await connect(uri);
    console.log('MongoDB connected (persistent memory fallback)');
  }
};

module.exports = connectDB;
