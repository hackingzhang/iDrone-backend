/*jslint es6 */
'use strict';

const path = require("path");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const session = require("../utils/session");
const config = require("./environment");

module.exports = function (app) {
  // 格式化multipart/form-data
  // app.use(multipart());

  // 格式化JSON
  app.use(bodyParser.json());
  // 日志
  app.use(morgan('dev'));

  app.use('/', express.static('public'));

  // 获取session信息并设置req.session变量
  // sessionId保存在请求头的authorization字段中，格式为"Bearer token"
  app.use(async (req, res, next) => {
    let sessionId;
    if(req.headers.authorization){
      let authorization  = req.headers.authorization.split(' '),
          bearer = authorization[0],
          token = authorization[1];

      if(bearer === "Bearer" && (typeof token === 'string') && token.length > 0)
        sessionId = token;
    }

    // 如果sessionID不为空，获取session信息
    if(sessionId != undefined && sessionId.trim().length > 0){
      let sessionData = await session.get(sessionId)
      req.session = sessionData;
    }

    next();
  });
}