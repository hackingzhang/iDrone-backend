/*jslint es6 */
'use strict';

const uuid = require("uuid");
const { User, Cart } = require("../utils/orm");

/**
 *  UserModel
 *  @module
 */

const userModel = {
  /**
   *  用户登录
   *  @name login
   *  @method
   *  @memberOf userModel
   *  @param {String} id - 用户ID
   *	@param {String} idType - ID类型, 取值为 'openid', 'unionid', 'customid'
   *  @returns {Promise} - 一个 promise，resolve 用户信息
   */
  login(id, idType="id") {
    return new Promise((resolve, reject) => {
      // 根据 idType 构造查询条件
      let whereCondition = {};

      if(idType === 'unionid')
        whereCondition.unionid = id;
      else if(idType === 'openid')
        whereCondition.openid = id;
      else
        whereCondition.id = id;

      // 查询该用户是否存在于数据库中
      User.findOne({
        where: whereCondition
      })
      .then(user => {
        if(user !== null){
          resolve(user);
        }
        // 如果用户不存在，reject
        else{
          reject({errcode: 404, errmsg: "用户不存在"});
        }
      });
    });
  },

  /**
   *  注册
   *  @name regist
   *  @method
   *  @memberOf userModel
   *  @param {String} openid - 小程序openid
   *	@param {String} unionid - 公众平台unionid
   *  @returns {Promise} - 一个promise,
   *  @example
   *
   *  returnDescribe
   */
  regist(openid, unionid) {
    return new Promise((resolve, reject) => {
      // 构建一个user
      let newUser = User.build({
        id: uuid.v1(),
        openid,
        unionid
      });

      // 保存到数据库
      newUser.save()
      .then((user) => {
        user.setCart(Cart.build({
          id: uuid.v1()
        }))
        .then(cart => {
          resolve(user);
        })
        .catch(error => {
          reject({errcode: 500, errmsg: "数据库错误", data: error})
        });
      })
      .catch((error) => {
        reject({errcode: 500, errmsg: "数据库错误", data: error})
      });
    });
  },

  /**
   *  修改昵称
   *  @name changeNickname
   *  @method
   *  @memberOf userModel
   *  @param {String} id - 用户ID
   *  @param {String} newNickname - 新昵称
   *  @returns {Promise} - 一个promise，resolve {}
   */
   changeNickname(id, newNickname) {
     return new Promise((resolve, reject) => {
       User.update({
         nickname: newNickname
       },{
         where: {
           id
         }
       })
       .then(result => {
         if(result[0] === 1)
           resolve();
         else
           reject({ errcode: 404, errmsg: "用户不存在" });
       })
       .catch(error => {
         reject({errcode: 500, errmsg: "数据库错误", data: error});
       });
     });
   },

   /**
    *  修改头像
    *  @name changeAvatar
    *  @method
    *  @memberOf userModel
    *  @param {String} id - 用户ID
    *  @param {String} avatar - 头像文件名
    *  @returns {Promise} - 一个promise，resolve
    */
  changeAvatar(id, avatar) {
    return new Promise((resolve, reject) => {
      User.update({
         avatar
       },{
         where: {
           id
         }
       })
       .then(result => {
         if(result[0] === 1)
           resolve({id, avatar});
         else
           reject({ errcode: 404, errmsg: "用户不存在" });

       })
       .catch(error => {
         reject({errcode: 500, errmsg: "数据库错误", data: error});
       });
    });
  }
}

module.exports = userModel;