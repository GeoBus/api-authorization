"use strict";

/* * * * * */
/* PING WHEN DOWN */
/* * */

/* * */
/* IMPORTS */
const config = require("config");
const database = require("./services/database");
const monitor = require("./services/monitor");
const Website = require("./models/Website");

/* * *
 * MONITOR
 */
(async () => {
  console.log();
  console.log("* * * * * * * * * * * * * * * * * * * * * * * * * *");
  console.log("* * * * * * PING WHEN DOWN —> MONITOR * * * * * * *");
  console.log("* * * * * * * * * * * * * * * * * * * * * * * * * *");

  const monitorIsOn = config.get("monitor-is-on");
  const startTime = process.hrtime();

  console.log();
  console.log("- - - - - - - - - - - - - - - - - -");
  console.log("- Monitor is On: " + monitorIsOn);
  console.log("- - - - - - - - - - - - - - - - - -");
  console.log();

  // If monitor is off
  if (!monitorIsOn) return;
  else console.log("Starting...");

  // Connect to the database
  await database.connect();

  // Get all websites from the database.
  console.log("Fetching from database...");
  const websites = await Website.find({});

  // If there are no websites to monitor, log and return.
  if (!websites.length) return console.log("No websites to monitor.");
  else console.log("Starting monitor for " + websites.length + " websites.");

  // For each website initiate monitoring
  for (const website of websites) await monitor.start(website);

  console.log();
  console.log("* * * * * * * * * * * * * * * * * * * * * * * * * *");
  console.log("Shutting down...");

  await database.disconnect();

  console.log("Operation took " + getDuration(startTime) / 1000 + " seconds.");
  console.log("* * * * * * * * * * * * * * * * * * * * * * * * * *");
  console.log();
})();

/* * */
/* At program initiation all websites are retrieved from the database */
/* and one ping-monitor instance is set up for each. */
const getDuration = (startTime) => {
  const interval = process.hrtime(startTime);
  return parseInt(
    // seconds -> miliseconds +
    interval[0] * 1000 +
      // + nanoseconds -> miliseconds
      interval[1] / 1000000
  );
};
