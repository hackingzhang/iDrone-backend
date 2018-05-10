/*jslint es6 */
/*jslint node: true */

'use strict';

const fs = require("fs");
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
    key: fs.readFileSync(),
    cert: fs.readFileSync(),
  }

  
}
else {
  app.listen(config.port, () => {
    console.log("Listening on port:", config.port);
  });
}