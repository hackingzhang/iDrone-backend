/*jslint es6 */
/*jslint node: true */

'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator/check');
const orderModel = require('../model/order_model');
const checkLogin = require('../utils/check_login');

let router = express.Router();

/**
 * 新订单
 *
 * 该接口需要请求体包含一个商品列表，格式如下：
 * [{ id: "商品ID", amount: "商品数量" }, ...]
 */
router.put('/',
  [
    check('goods_list', '至少需要一个商品')
  ],
  (req, res) => {
    // 验证是否登录
    if (checkLogin(req) === false)
      return res.status(401).end();

    try {
      validationResult(req).throw()

      orderModel.add(req.session.id, req.body.goods_list)
        .then(data => {
          res.json(data)
        })
        .catch(error => {
          res.status(error.errcode).json(error)
        })
    } catch (error) {
      res.status(422).json(error.mapped())
    }
  }
)

/**
 * 获取订单信息
 */
router.get('/',
  [
    check('order_id', '缺少订单ID').exists()
  ],
  (req, res) => {
    // 验证是否登录
    if (checkLogin(req) === false) { return res.status(401).send() }

    try {
      validationResult(req).throw()

      orderModel.get(req.query.order_id)
        .then(data => {
        // 如果该订单不属于该用户，返回404
          if (data.user_id !== req.session.id) { return res.status(404).send() } else { res.json(data) }
        })
        .catch(error => {
          res.status(error.errcode).json(error)
        })
    } catch (error) {
      res.status(422).json(error.mapped())
    }
  })

/**
 * 获取订单列表
 */
router.get('/list', (req, res) => {
  // 验证是否登录
  if (checkLogin(req) === false) { return res.status(401).send() }

  let page = req.body.page || 1

  orderModel.getListByUser(req.session.id, page, 24)
    .then(data => {
      res.json(data)
    })
    .catch(error => {
      res.status(error.errcode).json(error)
    })
})

module.exports = router
