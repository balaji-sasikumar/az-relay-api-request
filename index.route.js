const express = require("express");
const axios = require("axios");
const https = require("hyco-https");
const router = express.Router();

const ns = process.env.ns;
const path = process.env.path;
const keyrule = process.env.keyrule;
const key = process.env.key;

router.post("/query", async function (req, res, next) {
  const body = req.body;
  console.log(body);
  const data = await new Promise((resolve, reject) => {
    https
      .get(
        {
          hostname: ns,
          path:
            (!path || path.length == 0 || path[0] !== "/" ? "/" : "") + path,
          port: 443,
          headers: {
            ServiceBusAuthorization: https.createRelayToken(
              https.createRelayHttpsUri(ns, path),
              keyrule,
              key
            ),
            "Content-Type": "application/json",
            body: JSON.stringify(body),
          },
        },
        (res) => {
          if (res.statusCode !== 200) {
            resolve({
              message: `Request Failed.\n Status Code: ${res.statusCode}`,
            });
            res.resume();
          } else {
            res.setEncoding("utf8");
            let data;
            res.on("data", (chunk) => {
              data = chunk;
            });
            res.on("end", () => {
              console.log(`Response: ${data}`);
              resolve(JSON.parse(data));
            });
          }
        }
      )
      .on("error", (e) => {
        resolve({
          message: `Got error: ${e.message}`,
        });
      });
  });
  res.json(data);
});

module.exports = router;
