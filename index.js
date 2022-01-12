// External imports:
require("dotenv").config();
const readline = require("readline");

// Internal imports:
const { populateMongoSubScript } = require("./internal-scripts/populate-mongo");
const {
  applyMongoTagsSubScript,
} = require("./internal-scripts/apply-mongo-tags");

// Set-up to allow command line input to be assigned to variables, and program to exit when done
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("close", () => process.exit(0));
const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

const executeChosenScript = async (scriptNumber) => {
  switch (scriptNumber) {
    case "0":
      console.log("Exiting...");
      rl.close();
      break;
    case "1":
      await populateMongoSubScript(prompt);
      break;
    case "2":
      await applyMongoTagsSubScript(prompt);
      break;
    default:
      console.log("No script found with this number");
  }

  chooseAndExecuteChosenScript();
};

const chooseAndExecuteChosenScript = async () => {
  const scriptNumber = await prompt(`
  -----------------------------------
  Which script would you like to run? (enter a number):
  -----------------------------------
  0. Exit
  1. Populate Mongo (Calls Confluence API for all pages in a single Confluence Space and saves metadata in a Mongo collection of your choice)
  2. Apply tags to Mongo (Calls Confluence API individually for each page in designated Mongo collection that is flagged as not-yet-updated)
  -----------------------------------
  `);

  if (scriptNumber) {
    await executeChosenScript(scriptNumber);
  } else {
    console.log("You must choose a script number");
    chooseAndExecuteChosenScript();
  }
};

chooseAndExecuteChosenScript();
