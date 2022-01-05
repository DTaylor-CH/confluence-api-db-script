// External imports:
require("dotenv").config();
const readline = require("readline");

// Internal imports:
const { populateMongoSubScript } = require("./internal-scripts/populate-mongo");

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
      console.log("Script exiting");
      rl.close();
      break;
    case "1":
      await populateMongoSubScript(prompt);
      break;
    default:
      console.log("No script found with this number");
  }

  chooseAndExecuteChosenScript();
};

const chooseAndExecuteChosenScript = async () => {
  const scriptNumber = await prompt(
    `
Which script would you like to run?:
  0. Exit
  1. Populate Mongo (Calls Confluence API for all pages in a single Confluence Space and saves metadata in a Mongo collection of your choice)
    
    `
  );

  if (scriptNumber) {
    executeChosenScript(scriptNumber);
  } else {
    console.log("You must choose a script number");
    chooseAndExecuteChosenScript();
  }
};

chooseAndExecuteChosenScript();
