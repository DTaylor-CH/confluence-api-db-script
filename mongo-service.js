// External imports:
const { MongoClient } = require("mongodb");

// Module variables:
let _client;
let _db;
let _collectionName;
let _lastSuccessfulUpsert;

// Getters/Setters for module variables:
const setDbParameters = (mongoUri, dbName, collectionName) => {
  _client = new MongoClient(`${mongoUri}/${dbName}`);
  _db = dbName;
  _collectionName = collectionName;
};

// Module functions/methods:
const mongoConnect = async () => {
  try {
    await _client.connect();
    console.log("DB connection succeeded");
  } catch {
    console.log(error);
    throw new Error("DB connection failed");
  }
};

const mongoDisconnect = async () => {
  try {
    await _client.close();
    console.log("DB connection closed");
  } catch {
    throw new Error("DB disconnection failed");
  }
};

const persistGetCallResponses = async (postsArray) => {
  for (post of postsArray) {
    // making it clearer that the post's ID (called just 'id' in API response) relates to post rather than Mongo ID by renaming it 'post_id'
    // delete Object.assign(post, { ["post_id"]: post["id"] })["id"];

    try {
      await _client
        .db(_db)
        .collection(_collectionName)
        .updateOne(
          { post_id: post.id },
          {
            $set: {
              post_id: post.id,
              title: post.title,
              status: post.status,
              webui: post._links.webui,
            },
          },
          { upsert: true }
        );
    } catch (err) {
      console.log(err);
      throw new Error(
        `Update document failed. Last successful update was page_id: ${_lastSuccessfulUpsert}`
      );
    }
  }
};

module.exports = {
  setDbParameters,
  mongoConnect,
  mongoDisconnect,
  persistGetCallResponses,
};
