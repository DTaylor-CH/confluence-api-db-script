// Internal imports:
const {
  setDbParameters,
  mongoConnect,
  mongoDisconnect,
  getMongoTaggedPostsNotInConfluence,
} = require("../external-services/mongo-service");

const {
  setAuthorisationHeader,
  setConfluenceSpace,
  setMongoTagsInConfluence,
} = require("../external-services/confluence-api");

// User inputs own parametes for Mongo script or accepts env vars as default (by pressing 'enter')
const applyMongoTagsSubScript = async (prompt) => {
  const spaceName =
    (await prompt(
      `What is your Confluence Space name? (default=${process.env.SPACE_NAME}): `
    )) || process.env.SPACE_NAME;

  const mongoUri =
    (await prompt(
      `What is your MongoDB URI? (default=${process.env.MONGO_URI}): `
    )) || process.env.MONGO_URI;

  const dbName =
    (await prompt(
      `What is your Database name? (default=confluence_pages): `
    )) || "confluence_pages";

  const collectionName =
    (await prompt(
      `What is your Collection name? (default=${spaceName.toLowerCase()}_space): `
    )) || spaceName.toLowerCase() + "_space";

  const accessToken =
    (await prompt(
      `Whats is your Confluence API Access Token? (default=${process.env.ACCESS_TOKEN}): `
    )) || process.env.ACCESS_TOKEN;

  // guard against any undefined values before Mongo update script starts
  if (mongoUri && dbName && collectionName && spaceName && accessToken) {
    setDbParameters(mongoUri, dbName, collectionName);
    setAuthorisationHeader(accessToken);
    setConfluenceSpace(spaceName);

    await mongoConnect();

    const cursor = await getMongoTaggedPostsNotInConfluence();
    await setMongoTagsInConfluence(cursor);
    await cursor.close();

    await mongoDisconnect();
  } else {
    console.log(
      "All values must be set, either by environment variables or by user input"
    );
  }
};

module.exports = {
  applyMongoTagsSubScript,
};
