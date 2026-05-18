
const { MongoClient, ObjectId } = require('mongodb');

async function run() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('university-erp');
    
    const students = await db.collection('studentprofiles').find().toArray();
    console.log(`Found ${students.length} students in studentprofiles collection`);
    
    const suresh = await db.collection('users').findOne({ username: 'finance_head' });
    console.log('Finance User UnivId:', suresh.universityId);
    
    // Update them all
    const res = await db.collection('studentprofiles').updateMany({}, { $set: { universityId: suresh.universityId } });
    console.log(`Direct Mongo Update: ${res.modifiedCount} modified, ${res.matchedCount} matched`);
    
    const first = await db.collection('studentprofiles').findOne();
    console.log('First student after update:', first.universityId);
    
    await client.close();
}

run().catch(console.dir);
