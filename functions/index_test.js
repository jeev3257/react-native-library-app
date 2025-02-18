const functions = require("firebase-functions");

exports.testFunction = functions.auth.user().onCreate(async (user) => {
  console.log("Test function triggered!");
  console.log("User:", user);
});
