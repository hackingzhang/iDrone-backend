/*jslint es6 */
/*jslint node: true */

'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator/check');
const cartModel = require('../model/cart_model');
const checkLogin = require('../utils/check_login');

let router = express.Router();

/**
 * 添加到购物车
 */
router.put('/',
  [
    check('goods_id', '缺少商品ID').exists(),
    check('amount', '请输入商品数量').exists()
  ],
  (req, res) => {
    try {
      validationResult(req).throw();

      cartModel.addGoods(req.session.id, req.body.goods_id, req.body.amount)
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        res.status(error.errcode).json(error);
      });
    } catch (error) {
      res.status(422).send(error.mapped());
    }
  }
)

/**
 * 获取购物车信息
 */
router.get('/', (req, res) => {
  // 验证是否登录
  if (checkLogin(req) === false)
    return res.status(401).send();

  cartModel.get(req.session.id)
    .then(data => {
      res.json(data)
    })
    .catch(error => {
      res.status(error.errcode).json(error)
    })
})

/**
 * 从购物车移除
 */
router.delete('/',
  [
    check('goods_id', '缺少商品ID').exists()
  ],
  (req, res) => {
    // 验证是否登录
    if (checkLogin(req) === false) { return res.status(401).send() }

    try {
      validationResult(req).throw()

      cartModel.removeGoods(req.session.id, req.body.goods_id)
        .then(result => {
          res.end();
        })
        .catch(error => {
          res.status(error.errcode).send(error)
        })
    } catch (error) {
      res.status(422).json(error.mapped())
    }
  })

module.exports = router
