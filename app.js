/*jslint es6 */
/*jslint node: true */

'use strict';

const fs = require("fs");
const http = require("http");
const https = require("https");
const express = require("express");

const config = require("./config/environment");
const expressConfig = require("./config/express");
const router = require("./router");

const app = express();

expressConfig(app);
router(app);

if (config.mode === "product") {
  let httpsOptions = {
    key: fs.readFileSync(config.https_key_file),
    cert: fs.readFileSync(config.https_cert_file)
  }

  http.createServer(app).listen(config.port);
  https.createServer(httpsOptions, app).listen(config.https_port);
}
else {
  app.listen(config.port, () => {
    console.log("Listening on port:", config.port);
  });
}