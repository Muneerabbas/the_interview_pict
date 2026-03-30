const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://manaskhairnar1511_db_user:ShvgZxzTXRLqOPbJ@experiencecluster.xpwg3kn.mongodb.net/?appName=experienceCluster";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('int-exp');
    const cols = await db.listCollections().toArray();
    for (const c of cols) {
       const cnt = await db.collection(c.name).countDocuments();
       console.log(`Collection: ${c.name} - count: ${cnt}`);
    }
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
