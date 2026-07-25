const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
let client;
let dbInstance;

async function connect() {
  if (dbInstance) return dbInstance;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set. See README for setup steps.');
  }
  client = new MongoClient(uri);
  await client.connect();
  dbInstance = client.db('pos_closing_report');
  await dbInstance.collection('users').createIndex({ username: 1 }, { unique: true });
  await dbInstance.collection('entries').createIndex({ entry_date: -1 });
  return dbInstance;
}

function toId(id) {
  return new ObjectId(String(id));
}

module.exports = { connect, toId, ObjectId };
