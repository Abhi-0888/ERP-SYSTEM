
const { MongoClient, ObjectId } = require('mongodb');

async function run() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('university-erp');
    
    const rahul = await db.collection('users').findOne({ email: 'rahul.s@srmap.edu.in' });
    console.log('Rahul User UnivId:', rahul.universityId);
    
    const students = await db.collection('users').find({ role: 'STUDENT' }).toArray();
    console.log(`Checking ${students.length} student users...`);
    
    const suresh = await db.collection('users').findOne({ username: 'finance_head' });
    const univId = suresh.universityId;
    
    // Update all student users to have the same universityId
    const res = await db.collection('users').updateMany({ role: 'STUDENT' }, { $set: { universityId: univId } });
    console.log(`Updated ${res.modifiedCount} student users with universityId`);
    
    await client.close();
}

run().catch(console.dir);
