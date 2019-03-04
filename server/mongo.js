const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(process.env.MONGO_URL);

if(!process.env.MONGO_URL) {
    console.error('No MONGO_URL env var configured');
    process.exit();
}

client.connect((err) => {
    if(err) {
        console.error(err);
        process.exit();
    }
    console.log('MongoDB connected successfully on',    process.env.MONGO_URL);
    module.exports.db = client.db();
});

module.exports.ObjectId = require('mongodb').ObjectID;