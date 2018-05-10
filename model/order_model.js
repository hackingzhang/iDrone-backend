/*jslint es6 */
/*jslint node: true */

'use strict';

const uuid = require("uuid");
const { sequelize, Order, Goods } = require("../utils/orm");

const orderModel = {
  /**
   *  新订单
   *  @name add
   *  @method
   *  @memberOf orderModel
   *  @param {String} userId - 用户ID
   *  @param {Array} goodsList - 商品列表，包含商品id和购买数量，
       示例：[{id: "", amount: 2}]
   *  @returns {Promise} - resolve 结果
   */
  add(userId, goodsList){
    return new Promise((resolve, reject) => {
      let order = Order.build({
        id: uuid.v1(),
        status: 0,
        user_id: userId
      });

      sequelize.transaction((t) => {
        return order.save({ transaction: t })
        .then(result => {
          let promiseList = [];
          for(let goodsInfo of goodsList){
            let goods = Goods.build({ id: goodsInfo.id });
            let promise = order.addGoods(goods, {
              through: { amount: goodsInfo.amount },
              transaction: t
            });

            promiseList.push(promise);
          }
          return Promise.all(promiseList);
        });
      })
      .then(result => {
        resolve(order);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      });
    });
  },
  /**
   *  获取订单详情
   *  @name get
   *  @method
   *  @memberOf orderModel
   *  @param {String} orderId - 订单ID
   *  @returns {Promise} - resolve订单详情
   */
  get(orderId) {
    return new Promise((resolve, reject) => {
      Order.findOne({
        where: { id: orderId },
        include: [{
          model: Goods,
          attributes: ["id", "title", "image"]
        }]
      })
      .then(order => {
        if(order !== null)
          resolve(order);
        else
          reject({ errcode: 404, errmsg: "订单不存在" });
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      });
    });
  },
  /**
   *  获取某一用户的订单列表
   *  @name getListById
   *  @method
   *  @memberOf orderModel
   *  @param {String} userId - 用户ID
   *  @param {String} page - 页码
   *  @param {String} countPerPage - 每页条目数
   *  @returns {Promise} - resolve订单列表
   */
  getListByUser(userId, page=1, countPerPage=24) {
    return new Promise((resolve, reject) => {
      Order.findAll({
        where: {
          user_id: userId
        },
        include: [{
          model: Goods,
          attributes: ["id", "title", "image"]
        }],
        limit: countPerPage,
        offset: (page - 1) * countPerPage,
        order: [["created_at", "DESC"]]
      })
      .then(orderList => {
        resolve(orderList);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      });
    });
  },
  /**
   *  获取订单列表
   *  @name getList
   *  @method
   *  @memberOf orderModel
   *  @param {String} page - 页码
   *  @param {String} countPerPage - 每页项目数
   *  @returns {Promise} - resolve订单列表
   */
  getList(page=1, countPerPage=24) {
    return new Promise((resolve, reject) => {
      Order.findAll({
        where: {},
        limit: countPerPage,
        offset: (page - 1) * countPerPage,
        order: [["created_at", "DESC"]]
      })
      .then(orderList => {
        resolve(orderList);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      });
    });
  }
};

module.exports = orderModel;