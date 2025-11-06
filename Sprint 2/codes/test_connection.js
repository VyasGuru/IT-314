import { MongoClient } from 'mongodb';
const MONGO_URL = 'mongodb://localhost:27017'; 
const DB_NAME = 'real_estate_db_test'; 

console.log('Attempting to connect to MongoDB...');
console.log(`Connecting to: ${MONGO_URL}`);

async function runTest() {
  let client; 

  try {
    
    client = new MongoClient(MONGO_URL);
    await client.connect();
    
    console.log('-------------------------------------------');
    console.log(' SUCCESS: Connected to MongoDB server!');
    console.log('-------------------------------------------');

    const db = client.db(DB_NAME);
    console.log(`Successfully selected database: "${DB_NAME}"`);

    const testCollection = db.collection('connection_test');
    
    const insertResult = await testCollection.insertOne({
      message: 'Connection successful!',
      timestamp: new Date(),
    });

    console.log(`Successfully inserted test document with _id: ${insertResult.insertedId}`);
    
    console.log('Successfully dropped test collection.');
    
    console.log('\n All tests passed! Your connection is working.');

  } catch (err) {
    console.error('\n TEST FAILED: Could not connect or run test.');
    console.error(err);
    
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed.');
    }
  }
}

runTest();