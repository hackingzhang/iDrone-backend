/*jslint es6 */
/*jslint node: true */

'use strict';

const uuid = require("uuid");
const Op = require("sequelize").Op;
const { Goods, GoodsCategory } = require("../utils/orm");

/**
 *  goodsModel
 *  @module
 */
const goodsModel = {
  /**
   *  添加商品
   *  @name add
   *  @method
   *  @memberOf goodsModel
   *  @param {String} title - 商品标题
   *  @param {String} price - 价格
   *  @param {String} sale - 销量
   *  @param {String} stock - 库存
   *  @param {String} freight - 运费
   *  @param {String} image - 商品图（列表显示）
   *  @param {String} previews - 预览图
   *  @param {String} brief - 商品简介
   *  @param {String} categoryId - 分类
   *  @returns {Promise} - resolve 刚添加的商品信息
   */
  add(title, price, sale, stock, freight, image, previews, brief, categoryId) {
    return new Promise((resolve, reject) => {
      let newGoods = Goods.build({
        id: uuid.v1(),
        title,
        price,
        sale,
        stock,
        freight,
        image,
        previews,
        brief,
        category_id: categoryId
      });

      newGoods.save()
      .then(goods => {
        resolve(goods);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error});
      });
    });
  },

  /**
   *  添加商品分类
   *  @name addCategory
   *  @method
   *  @memberOf goodsModel
   *  @param {String} title - 分类名
   *  @returns {Promise} - resolve 刚添加的分类信息
   */
  addCategory(title) {
    return new Promise((resolve, reject) => {
      GoodsCategory.create({
        id: uuid.v1(),
        title
      })
      .then(goodsCategory => {
        resolve(goodsCategory);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error});
      });
    });
  },

  /**
   *  获取商品分类列表
   *  @name getCategoryList
   *  @method
   *  @memberOf goodsModel
   *  @returns {Promise} - resolve 商品分类列表
   */
  getCategoryList (){
    return new Promise((resolve, reject) => {
      GoodsCategory.findAll({ where: {} })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(data);
      });
    });
  },

  /**
   *  根据商品ID获取商品信息
   *  @name get
   *  @method
   *  @memberOf videoModel
   *  @param {String} id - 商品ID
   *  @returns {Promise} - resolve 商品信息
   */
   get(id) {
     return new Promise((resolve, reject) => {
       Goods.findOne({
         where: {
           id
         }
       })
       .then(goods => {
         if(goods !== null)
           resolve(goods);
         else
           reject({ errcode: 404, errmsg: "商品不存在" });
       })
       .catch(error => {
         reject({ errcode: 500, errmsg: "数据库错误", data: error });
       });
     });
   },

   /**
    *  获取分类下所有商品
    *  @name getListByCategory
    *  @method
    *  @memberOf goodsModel
    *  @param {String} categoryId - 分类ID
    *  @param {String} page - 页码
    *  @param {String} countPerPage - 每页数量
    *  @returns {Promise} - resolve 商品列表
    */
  getListByCategory(categoryId, page=1, countPerPage=24) {
    return new Promise((resolve, reject) => {
      Goods.findAll({
        where: {
          category_id: categoryId
        },
        limit: countPerPage,
        offset: (page - 1) * countPerPage
      })
      .then(goodsList => {
        resolve(goodsList);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      });
    });
  },

  /**
   *  商品搜索
   *  @name search
   *  @method
   *  @memberOf goodsModel
   *  @param {String} keyword - 关键字
   *  @param {String} page - 页码
   *  @param {String} countPerPage - 每页商品数
   *  @returns {Promise} - resolve 符合条件的商品列表
   */
  search(keyword, page=1, countPerPage=24) {
    return new Promise((resolve, reject) => {
      Goods.findAll({
        where: {
          title: {
            [Op.like]: `%${keyword}%`
          }
        },
        limit: countPerPage,
        offset: (page - 1) * countPerPage
      })
      .then(goodsList => {
        resolve(goodsList);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      });
    });
  },

  /**
   *  获取商品列表
   *  @name getList
   *  @method
   *  @memberOf goodsModel
   *  @param {String} page - 页码
   *  @param {String} countPerPage - 每页商品数
   *  @returns {Promise} - resolve商品列表
   */
  getList(page=1, countPerPage=24) {
    return new Promise((resolve, reject) => {
      Goods.findAll({
        where: {},
        limit: countPerPage,
        offset: (page - 1) * countPerPage,
        order: [["sale", "DESC"]]
      })
      .then(goodsList => {
        resolve(goodsList);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      });
    });
  }
};

module.exports = goodsModel;