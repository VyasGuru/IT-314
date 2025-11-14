import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/';
const DB_NAME = process.env.DB_NAME || 'real_estate_db';
export async function getMongoClient() {
  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log(`Successfully connected to MongoDB at ${MONGO_URL}`);
    return client;
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
}
export async function getDatabase() {
  const client = await getMongoClient();
  const db = client.db(DB_NAME);
  console.log(`Using database: ${DB_NAME}`);
  return { client, db };
}
export async function closeConnection(client) {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

export { MONGO_URL, DB_NAME };
