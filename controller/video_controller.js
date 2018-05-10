/*jslint es6 */
/*jslint node: true */

const uuid = require("uuid");
const cuid = require("cuid");
const path = require("path");
const multer = require("multer");
const express = require("express");
const { check, validationResult } = require("express-validator/check");
const config = require("../config/environment");
const videoModel = require("../model/video_model");
const checkLogin = require("../utils/check_login");
const createMulterUpload = require("../utils/create_multer_upload");

// 设置multer upload
let videoUpload = createMulterUpload(config.video_dir,
        config.video_allowed,
        config.video_size_limit),
      videoCoverUpload = createMulterUpload(config.video_cover_dir,
        config.image_allowed,
        config.video_cover_limit);

let router = express.Router();
/**
 * 视频上传
 */
router.put('/upload', (req, res) => {
  // 检查登录
  if(checkLogin(req) === false)
    res.status(401).end();
  // 保存视频文件
  videoUpload.single("video")(req, res, (error) => {
    if(error)
      res.status(500).send({ data: error });
    else
      res.json({ filename: req.file.filename });
  });
});

/**
 * 视频封面上传
 */
router.put('/upload_cover', (req, res) => {
  if(checkLogin(req) === false)
    res.status(401).end();

    videoCoverUpload.single("video_cover")(req, res, (error) => {
      if(error)
        res.status(500).send({ data: error });
      else
        res.json({ filename: req.file.filename });
    });
});

/**
 * 添加视频
 */
router.put('/',
  [
    check("title", "视频标题是必填项且应在255个字符以内").isLength({ min: 1, max: 255 }),
    check("cover", "视频封面").exists().isLength({ min: 1, max: 65535 }),
    check("source", "缺少视频源地址").exists().isLength({ min: 1, max: 65535 })
  ],
  (req, res) => {
    // 验证是否登录
    if(checkLogin(req) === false)
      return res.status(401).send();

    try{
      validationResult(req).throw();

      // 将视频信息持久化到数据库
      videoModel.add(req.body.title, req.body.source, req.body.cover, req.session.id)
      .then(data =>{
        res.send(data);
      })
      .catch(error => {
        res.status(error.errcode).json(error);
      });
    }
    catch(error){
      return res.status(422).send(error.mapped());
    }
  }
);

/**
 * 获取视频列表
 */
router.get("/list", (req, res) => {
  let page = parseInt(req.query.page),
      userId = req.query.user_id,
      videoListPromise = null;

  if(isNaN(page) || page < 1)
    page = 1;

  if(userId !== undefined && userId !== null)
    videoListPromise = videoModel.getListByUser(userId, page, 24);
  else
    videoListPromise = videoModel.getList(page, 24);

  videoListPromise.then(data => {
    res.json(data);
  })
  .catch(error => {
    res.status(error.errcode).json(error);
  });
});

/**
 * 获取视频详细信息
 */
router.get("/",
  [
    check("id", "缺少视频ID").exists()
  ],
  (req, res) => {
    try{
      validationResult(req).throw();

      videoModel.get(req.body.id)
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        res.status(error.errcode).json(error);
      });
    }
    catch(error) {
      res.status(422).json(error.mapped);
    }
});

/**
 * 搜索视频
 */
router.get("/search",
  [
    check("keyword", "").trim().isLength({min: 1, max: 255})
  ],
  (req, res) => {
    try{
      validationResult(req).throw();

      let page = parseInt(req.body.page);
      if(isNaN(page) || page < 1)
        page = 1;

      videoModel.search(req.query.keyword, page)
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        res.status(error.errcode).json(error);
      });
    }
    catch(error){
      res.status(422).json(error.mapped());
    }
});

module.exports = router;