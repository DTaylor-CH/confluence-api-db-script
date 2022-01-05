// External imports:
const fetch = require("node-fetch");

// Module variables:
const _baseUrl = "https://companieshouse.atlassian.net/wiki";
let _getAllPagesNextPage;

let _requestOptions = {
  method: "GET",
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
  console.log("Commencing API GET call");
  // starts as false, but will be set true if there is no 'next' link
  if (_getAllPagesNextPage) {
    return fetch(_baseUrl + _getAllPagesNextPage, _requestOptions)
      .then((response) => {
        return response.json();
      })
      .then((jsonResponseBody) => {
        _getAllPagesNextPage = jsonResponseBody?._links?.next || null;
        _allPages = [..._allPages, ...jsonResponseBody?.results] || [];
        return getAllPagesInSpaceConfluenceApi();
      })
      .catch((error) => console.log("error", error));
  } else {
    console.log(
      `API calls complete. Total of ${_allPages.length} entries found`
    );
  }
  return _allPages;
};

module.exports = {
  setAuthorisationHeader,
  setConfluenceSpace,
  getAllPagesInSpaceConfluenceApi,
};
