const express = require("express");
const axios = require("axios");
const https = require("hyco-https");
const router = express.Router();

const ns = process.env.ns;
const path = process.env.path;
const keyrule = process.env.keyrule;
const key = process.env.key;

router.post("/query", async function (req, res, next) {
  const body = JSON.stringify(req.body); // Convert request body to JSON string

  const options = {
    hostname: ns,
    path: (!path || path.length == 0 || path[0] !== "/" ? "/" : "") + path,
    port: 443,
    method: "POST", // Set method to POST
    headers: {
      ServiceBusAuthorization: https.createRelayToken(
        https.createRelayHttpsUri(ns, path),
        keyrule,
        key
      ),
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body), // Add content length header
    },
  };

  const data = await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`Response: ${data}`);
        resolve(JSON.parse(data));
      });
    });

    req.on("error", (e) => {
      console.error(`Got error: ${e.message}`);
      resolve({
        message: `Got error: ${e.message}`,
      });
    });
    req.write(body);
    req.end();
  });

  res.json(data);
});

module.exports = router;
