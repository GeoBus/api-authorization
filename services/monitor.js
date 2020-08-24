"use strict";

/* * * * * */
/* STATUS MONITOR */
/* * */

/* * */
/* IMPORTS */
const config = require("config");
const got = require("got");

/* * */
/* At program initiation all websites are retrieved from the database */
/* and one ping-monitor instance is set up for each. */
exports.start = async (website) => {
  console.log();
  console.log("---------------------------------------------------");

  // Check if website is active
  if (!website.active) {
    console.log(website.title + " is off.");
    return console.log("---------------------------------------------------");
  }

  console.log("Website: " + website.title);
  console.log("Protocol: " + website.protocol);
  console.log("Host: " + website.host);

  // Set request options
  const options = {
    url: website.protocol + "://" + website.host,
    timeout: config.get("default-timeout"),
    retry: config.get("default-retries"),
  };

  // Setup request
  await got(options)
    .then(async (res) => {
      console.log("Status: " + res.statusCode + " - " + res.statusMessage);
      console.log("Time: " + res.timings.phases.total + " ms");
      await website
        .set({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          responseTime: res.timings.phases.total,
          lastChecked: new Date().toISOString(),
        })
        .save();
    })
    .catch(async (err) => {
      console.log("Status: " + err.code + " - " + err.message);
      console.log("Time: " + err.timings.phases.total + " ms");
      await website
        .set({
          statusCode: -1,
          statusMessage: err.message,
          responseTime: err.timings.phases.total,
          lastChecked: new Date().toISOString(),
          lastDown: new Date().toISOString(),
        })
        .save();
    });

  console.log("---------------------------------------------------");
};
