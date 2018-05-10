/*jslint es6 */
/*jslint node: true */

'use strict';

/**
 *  检查是否登录
 *  @name checkLogin
 *  @function
 *  @param {Request} request - express Request实例
 *  @returns {Boolean} - true: 已登录  false: 未登录
 */
let checkLogin = (request, role="user") => {
  if(request.session === undefined || request.session === null)
    return false;
  else
    if(request.session.id && request.session.role === role)
      return true;
    else
      return false;
};

module.exports = checkLogin;