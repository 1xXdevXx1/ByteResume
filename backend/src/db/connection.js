const mongoose = require('mongoose');

let memoryServer = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume_analyzer';

  try {
    // Attempt standard connection first with 2.5s server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      autoIndex: true
    });
    console.log(`[MongoDB] Successfully connected to persistent MongoDB at: ${uri}`);
    return uri;
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to primary URI (${uri}): ${err.message}`);
    console.log('[MongoDB] Initializing standalone local MongoDB Community instance via MongoMemoryServer...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      // Attempt fixed port 27017 first so CLI tools / seed scripts can connect seamlessly
      try {
        memoryServer = await MongoMemoryServer.create({
          instance: {
            port: 27017,
            dbName: 'resume_analyzer'
          }
        });
      } catch (portErr) {
        console.log(`[MongoDB] Port 27017 in use or reserved, launching on dynamic port: ${portErr.message}`);
        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'resume_analyzer'
          }
        });
      }

      const memoryUri = memoryServer.getUri() + 'resume_analyzer';
      process.env.MONGODB_URI = memoryUri;

      await mongoose.connect(memoryUri, {
        autoIndex: true
      });

      console.log(`[MongoDB] Standalone MongoDB server active and connected at: ${memoryUri}`);
      return memoryUri;
    } catch (memErr) {
      console.error('[MongoDB] Fatal error initializing MongoDB engine:', memErr.message);
      throw memErr;
    }
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

module.exports = { connectDB, disconnectDB };
