/*jslint es6 */
/*jslint node: true */

'use strict';

const multer = require("multer");
const path = require("path");
const cuid = require("cuid");

/**
 *  生成 multer upload
 *  @name createUpload
 *  @function
 *  @param {String} destDir - 目标文件夹
 *  @param {Array} file_allow - 允许的文件扩展名（不带点）
 *  @returns {Object} - multer 对象
 */
let createMulterUpload = (destDir, fileTypeAllow, fileSize=1024000000000) => {
  let storage = multer.diskStorage({
    destination: function (req, files, cb) {
      cb(null, path.relative('.', destDir));
    },
    filename: function (req, files, cb) {
      cb(null, cuid());
    }
  });

  let upload = multer({
    storage,
    fileFilter (req, file, cb) {
      let fileExtname = path.extname(file.originalname)
      if (!(fileTypeAllow.includes(fileExtname))) {
        cb(null, false);
      } else {
        cb(null, true);
      }
    },
    limits: {
      fileSize
    }
  });

  return upload;
}

module.exports = createMulterUpload;