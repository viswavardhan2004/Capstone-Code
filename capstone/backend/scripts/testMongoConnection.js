const { MongoClient, ServerApiVersion } = require('mongodb');

// NOTE: For production, prefer using environment variables instead of hardcoding credentials.
// Example: const uri = process.env.MONGODB_URI;
// Provided credentials (username: karan, password: 12345) for quick connectivity test:
const uri = "mongodb+srv://karan:12345@capstone.tfninvq.mongodb.net/?appName=capstone";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  } finally {
    await client.close();
  }
}

run().catch((e) => {
  console.error("Unexpected error:", e);
});
