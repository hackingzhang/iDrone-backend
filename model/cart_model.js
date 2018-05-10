'use strict';

'use strict';

'use strict';

'use strict';

const { Cart, Goods } = require("../utils/orm");

let cartModel = {
  /**
   *  获取该用户购物车信息
   *  @name getByUser
   *  @function
   *  @param {String} userId - 用户ID
   *  @returns { Promise } - resolve 购物车信息
   */
  get(userId) {
    return new Promise((resolve, reject) => {
      Cart.findOne({
        where: {
          user_id: userId
        },
        include: [{
          model: Goods,
          attributes: ["id", "title", "image", "price"]
        }]
      })
      .then(cart => {
        if(cart !== null)
          resolve(cart);
        else
          reject({ errcode: 404, errmsg: "用户不存在" });
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      });
    });
  },
  /**
   *  购物车添加商品
   *  @name addGoods
   *  @method
   *  @memberOf cartModel
   *  @param {String} userId - 用户ID
   *  @param {String} goodsId - 商品ID
   *  @param {String} amount - 数量
   *  @returns {Promise} - resolve goodsInCart对象列表
   */
  addGoods(userId, goodsId, amount) {
    return new Promise((resolve, reject) => {
      let goods = Goods.build({
        id: goodsId
      });
      Cart.findOne({
        where: { user_id: userId }
      }).then(cart => {
        if(cart === null)
          return reject({ errcode: 404, errmsg: "用户不存在" });
        else
          return cart.addGoods(goods, {through: { amount }});
      })
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      });
    });
  },
  /**
   *  从购物车移除商品
   *  @name removeGoods
   *  @method
   *  @memberOf cartModel
   *  @param {String} userId - 用户ID
   *  @param {String} goodsId - 商品ID
   *  @returns {Promise} - resolve 执行结果
   */
  removeGoods(userId, goodsId) {
    return new Promise((resolve, reject) => {
      let goods = Goods.build({
        id: goodsId
      });
      Cart.findOne({
        where: { user_id: userId }
      })
      .then(cart => {
        return cart.removeGoods(goods);
      })
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      });
    });
  }
};

module.exports = cartModel;