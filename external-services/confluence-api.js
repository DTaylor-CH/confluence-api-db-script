// External imports:
const fetch = require("node-fetch");

// Internal imports:
const { changeMongoFieldSinglePage } = require("./mongo-service");

// Module variables:
const _baseUrl = "https://companieshouse.atlassian.net/wiki";
let _getAllPagesNextPage;

let _requestOptions = {
  headers: {},
  redirect: "follow",
};

let _allPages = [];

// Setters for module variables:
const setAuthorisationHeader = (apiKey) => {
  _requestOptions.headers = {
    Authorization: "Basic " + apiKey,
  };
};

const setConfluenceSpace = (spaceName) => {
  _getAllPagesNextPage = `/rest/api/content/search?cql=space=${spaceName} and type=page and lastmodified> "2000-01-01 00:00" order by created asc&limit=250&start=0`;
};

const getAllPagesInSpaceConfluenceApi = async () => {
  _requestOptions.method = "GET";

  console.log("Commencing API GET call");
  // starts as false, but will be set true if there is no 'next' link
  if (_getAllPagesNextPage) {
    return fetch(_baseUrl + _getAllPagesNextPage, _requestOptions)
      .then((response) => {
        if (response.status !== 200) {
          throw `API GET call was unsuccessful. Confluence server response: ${response.status}`;
        } else {
          return response.json();
        }
        // return response.json();
      })
      .then((jsonResponseBody) => {
        _getAllPagesNextPage = jsonResponseBody?._links?.next || null;
        _allPages = [..._allPages, ...jsonResponseBody?.results] || [];
        return getAllPagesInSpaceConfluenceApi();
      })
      .catch((error) => console.log("Error:", error));
  } else {
    console.log(
      `API calls complete. Total of ${_allPages.length} entries found`
    );
  }
  return _allPages;
};

const setSinglePageTagsInConfluence = async (page) => {
  // some array manipulation needed as Confluence API requires labels as string and treats both spaces and commas as separators
  const tagsToAddWithUnderscores = page.gui_suggested_tags.map((tag) =>
    tag.replaceAll(":", "").replaceAll(" ", "_")
  );
  const tagsToAddWithUnderscoresAsString = tagsToAddWithUnderscores.join(", ");

  // update request headers (default is body-less GET). Reusing _requestOptions object so that authorisation header code can be reused
  _requestOptions.method = "POST";
  _requestOptions.headers["Content-Type"] = "application/json";
  _requestOptions.body = JSON.stringify({
    prefix: "global",
    name: tagsToAddWithUnderscoresAsString,
  });

  return fetch(
    `${_baseUrl}/rest/api/content/${page.post_id}/label`,
    _requestOptions
  )
    .then((res) => {
      if (res.status !== 200) {
        console.log("Error. Confluence server response: ", response.status);
      } else {
        return res;
      }
    })
    .catch((error) => error);
};

const setMongoTagsInConfluence = async (cursor) => {
  // print a message if no documents were found
  let successfulLabelUploadCount = 0;
  let unsuccessfulLabelUploadCount = 0;

  if ((await cursor.count()) === 0) {
    console.log(
      "No documents found which have tags not yet uploaded to Confluence"
    );
  } else {
    for await (const page of cursor) {
      console.log(
        `Attempting to tag "${page.title}" (ID: ${
          page.post_id
        }) in Confluence with the following tags: ${page.gui_suggested_tags.join(
          ", "
        )}`
      );

      const response = await setSinglePageTagsInConfluence(page);

      if (response.status !== 200) {
        console.log("Error. Confluence server response: ", response.status);
        unsuccessfulLabelUploadCount++;
      } else {
        await changeMongoFieldSinglePage(
          page.post_id,
          "tagged_in_confluence",
          true
        );
        successfulLabelUploadCount++;
      }
    }
    console.log(
      "Total successful labelling API calls: ",
      successfulLabelUploadCount,
      "| Total unsuccessful labelling API calls: ",
      unsuccessfulLabelUploadCount
    );
  }
};

module.exports = {
  setAuthorisationHeader,
  setConfluenceSpace,
  getAllPagesInSpaceConfluenceApi,
  setMongoTagsInConfluence,
};
