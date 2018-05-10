/*jslint es6 */
/*jslint node: true */

'use strict';

const fs = require('fs');
const path = require('path');
const cuid = require('cuid');
const multer = require('multer');
const express = require('express');
const { matchedData } = require('express-validator/filter');
const {check, validationResult} = require('express-validator/check');
const config = require('../config/environment');
const goodsModel = require('../model/goods_model');
const checkLogin = require('../utils/check_login');
const createMulterUpload = require("../utils/create_multer_upload");

let goodsCoverUpload = createMulterUpload(config.goods_cover_dir,
      config.image_allowed,
      config.goods_cover_limit),
  goodsPreviewUpload = createMulterUpload(config.goods_preview_dir,
      config.image_allowed,
      config.goods_preview_limit),
  goodsBriefImageUpload = createMulterUpload(config.goods_brief_image_dir,
      config.image_allowed,
      config.goods_brief_limit);

let router = express.Router();

/**
 * 获取商品信息
 */
router.get('/',
  [
    check('id', '缺少商品ID').exists()
  ],
  (req, res) => {
    try {
      validationResult(req).throw();

      goodsModel.get(req.query.id)
        .then(data => {
          res.json(data);
        })
        .catch(error => {
          res.status(error.errcode).json(error);
        })
    } catch (error) {
      res.status(422).send(error.mapped());
    }
  })

/**
 * 添加商品
 *
 * 1.将简介信息（HTML）写入文件
 * 2.写入成功，将商品信息持久化到数据库
 */
router.put('/',
  [
    check('title', '请输入商品标题').exists().isLength({ min: 1, max: 255 }),
    check('price', '请输入商品价格').exists(),
    check('sale', '请输入销量').exists(),
    check('stock', '请输入库存').exists(),
    check('freight', '请输入邮费').exists(),
    check('image', '请上传封面图片').exists(),
    check('previews', '您必须上传至少一张预览图').exists(),
    check('brief', '请输入商品简介').exists(),
    check('category_id').custom(value => {
      // 验证分类ID是否存在
      return new Promise((resolve, reject) => {
        // 如果 category_id 未设置，直接resolve，不进行后续检查，因为该参数允许为空
        if(value === undefined)
          return resolve();
        goodsModel.getCategoryList()
        .then(categoryList => {
          for(let category of categoryList)
            if(category.id === value)
              return resolve();

          throw new Error("分类信息不存在");
        })
        .catch(error => {
          reject(error);
        })
      })
    })
  ],
  (req, res) => {
    // 验证是否登录
    if (checkLogin(req, "admin") === false)
      return res.status(401).end();

    try {
      validationResult(req).throw()
      // 获取传入的参数
      let goodsObj = matchedData(req);
      let briefFileName = cuid();

      // 将简介写入文件
      fs.writeFile(path.resolve(config.goods_brief_dir, briefFileName),
        goodsObj.brief,
        (err) => {
          // 文件写入出错
          if (err) {
            res.status(500).json({errmsg: 'Write File Error'});
          }
          // 持久化到数据库
          else {
            goodsModel.add(goodsObj.title,
              goodsObj.price,
              goodsObj.sale,
              goodsObj.stock,
              goodsObj.freight,
              goodsObj.image,
              goodsObj.previews,
              briefFileName,
              goodsObj.category_id)
            .then(data => {
              res.json(data).end();
            })
            .catch(error => {
              res.status(error.errcode).json(error)
            })
          }
        }
      );
    } catch (error) {
      res.status(422).json(error.mapped())
    }
  }
)

/**
 * 添加商品分类
 */
router.put('/category',
  [
    check('title', '请输入分类名称').exists()
      .trim()
      .isLength({ min: 1, max: 255 })
      // 检查分类名是否存在
      .custom(value => {
        return new Promise((resolve, reject) => {
          goodsModel.getCategoryList()
          .then(categoryList => {
            for(let category of categoryList)
              if(category.title === value)
                throw new Error("分类名已存在");
            resolve();
          })
          .catch(error => {
            reject(error);
          })
        })
      })
  ],
  (req, res) => {
    try {
      validationResult(req).throw()
      // 持久化
      goodsModel.addCategory(req.body.title)
        .then(data => {
          res.json(data)
        })
        .catch(error => {
          res.status(error.errcode).json(error)
        })
    } catch (error) {
      res.status(422).send(error.mapped())
    }
  }
)

/**
 * 获取列表
 *
 * 如果请求中含有categoryId，则获取该分类下所有商品
 */
router.get('/list', (req, res) => {
  let page = parseInt(req.query.page),
    categoryId = req.query.category_id,
    goodsListPromise = null;

  if(isNaN(page) || page < 1) {
    page = 1;
  }

  if (categoryId === undefined || categoryId === null)
    goodsListPromise = goodsModel.getList(page, 24);
  else
    goodsListPromise = goodsModel.getListByCategory(categoryId, page, 24);

  goodsListPromise.then(data => {
    res.json(data);
  })
  .catch(error => {
    res.status(error.errcode).json(error);
  })
});

router.get('/search',
  [
    check('keyword', '关键字至少为1个字符且最多输入255个字符').isLength({ min: 1, max: 255 })
  ],
  (req, res) => {
    try {
      validationResult(req).throw()

      goodsModel.search(keyword)
        .then(data => {
          res.json(data)
        })
        .catch(error => {
          res.status(error.errcode).json(error)
        })
    } catch (error) {
      res.status(422).send(error.mapped())
    }
  });


/**
 * 封面上传
 */
router.put('/upload/cover', (req, res) => {
  // 验证是否登录
  if (checkLogin(req, "admin") === false) { return res.status(401).send() }

  goodsCoverUpload.single('cover')(req, res, (err) => {
    if (err) { res.status(500).send({ errmsg: '上传出错', data: err }) } else { res.send({ filename: req.file.filename }) }
  })
})

/**
 * 预览图上传
 */
router.put('/upload/preview', (req, res) => {
  // 验证是否登录
  if (checkLogin(req, "admin") === false) { return res.status(401).send() }

  goodsPreviewUpload.single('preview')(req, res, (err) => {
    if (err) { res.status(500).send({ errmsg: '上传出错', data: err }) } else { res.send({ filename: req.file.filename }) }
  })
})

/**
 * 简介图片上传
 */
router.put('/upload/brief_image', (req, res) => {
  // 验证是否登录
  if (checkLogin(req, "admin") === false) { return res.status(401).send() }

  goodsBriefImageUpload.single('brief_image')(req, res, (err) => {
    if (err) { res.status(500).send({ errmsg: '上传出错', data: err }) } else { res.send({ filename: req.file.filename }) }
  })
})

module.exports = router
