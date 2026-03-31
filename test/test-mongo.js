const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://manaskhairnar1511_db_user:ShvgZxzTXRLqOPbJ@experiencecluster.xpwg3kn.mongodb.net/?appName=experienceCluster";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('int-exp');
    const exp = db.collection('experience');
    
    const count = await exp.countDocuments();
    console.log("Total experience docs:", count);

    // Test page 3 skip
    const testPage3 = await exp.aggregate([
      { $sort: { date: -1 } },
      { $skip: 30 },
      { $limit: 10 }
    ]).toArray();
    console.log("Latest page 3 count:", testPage3.length);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
