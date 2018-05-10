/*jslint es6 */
/*jslint node: true */

'use strict';

const uuid = require("uuid");
const Sequelize = require("sequelize");
const { Video, User } = require("../utils/orm");

/**
 *  videoModel
 *  @module
 */

const videoModel = {
  /**
   *  添加视频
   *  @name add
   *  @method
   *  @memberOf videoModel
   *  @param {String} title - 标题
   *  @param {String} source - 视频地址
   *  @param {String} uploaderId - 上传者ID
   *  @returns {Promise} - resolve 新添加的视频信息
   */
  add(title, source, cover, uploaderId) {
    return new Promise((resolve, reject) => {
      let video = Video.build({
        id: uuid.v1(),
        title,
        source,
        cover,
        upload_at: new Date(),
        user_id: uploaderId
      });

      // let user = User.build({
      // 	id: uploaderId
      // });

      video.save()
      .then(video => {
        resolve(video);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      });
    });
  },

  /**
   *  根据视频ID获取视频信息
   *  @name get
   *  @method
   *  @memberOf videoModel
   *  @param {String} id - 视频ID
   *  @returns {Promise} - resolve 视频对象
   */
  get(id) {
    return new Promise((resolve, reject) => {
      Video.findOne({
        where: {
          id
        }
      })
      .then(video => {
        if(video !== null)
          resolve(video);
        else
          reject({ errcode: 404, errmsg: "视频信息不存在" });
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      });
    });
  },

  /**
   *  根据用户ID获取视频列表
   *  @name getListByUser
   *  @method
   *  @memberOf videoModel
   *  @param {String} userId - 用户ID
   *  @param {String} page - 页码
   *  @param {String} countPerPage - 每页条目数
   *  @returns {Promise} - resolve 视频列表
   */
  getListByUser(userId, page=1, countPerPage=24) {
    return new Promise((resolve, reject) => {
      Video.findAll({
        attributes: ["id", "title", "cover", "upload_at"],
        where: {
          user_id: userId
        },
        include: [{
          model: User,
          attributes: ["avatar", "nickname"],
          where: { id: Sequelize.col('Video.user_id') }
        }],
        offset: (page - 1) * countPerPage,
        limit: countPerPage
      })
      .then(videoList => {
        resolve(videoList);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      })
    });
  },

  /**
   *  获取视频列表（最新列表）
   *  @name getList
   *  @method
   *  @memberOf videoModel
   *  @param {String} page - 页码
   *  @param {String} countPerPage - 每页条目数
   *  @returns {Promise} - resolve 视频列表
   */
   getList(page, countPerPage) {
     return new Promise((resolve, reject) => {
      Video.findAll({
        attributes: ["id", "title", "cover", "upload_at"],
        include: [{
          model: User,
          attributes: ["id", "nickname", "avatar"],
          where: { id: Sequelize.col('Video.user_id') }
        }],
        offset: (page - 1) * countPerPage,
        limit: countPerPage,
        order: [
          ['upload_at', 'DESC']
        ]
      })
      .then(videoList => {
        resolve(videoList);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      })
    });
   },

   /**
    *  搜索视频信息
    *  @name search
    *  @method
    *  @memberOf videoModel
    *  @param {String} keyword - 关键字
    *  @returns {Promise} - resolve 视频列表
    */
   search(keyword, page=1, countPerPage=24) {
     return new Promise((resolve, reject) => {
      Video.findAll({
        attributes: ["id", "title", "cover", "upload_at"],
        where: {
          title: {
            [Sequelize.Op.like]: "%" + keyword + "%"
          }
        },
        include: [{
          model: User,
          attributes: ["id", "nickname", "avatar"],
          where: { id: Sequelize.col('Video.user_id') }
        }],
        offset: (page - 1) * countPerPage,
        limit: countPerPage,
        order: [
          ['upload_at', 'DESC']
        ]
      })
      .then(videoList => {
        resolve(videoList);
      })
      .catch(error => {
        reject({ errcode: 500, errmsg: "数据库错误", data: error });
      })
    });
   }
};

module.exports = videoModel;