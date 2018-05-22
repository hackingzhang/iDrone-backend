/*jslint es6 */
/*jslint node: true */

const uuid = require('uuid');
const cuid = require('cuid');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
const express = require('express');
const config = require('../config/environment');
const session = require('../utils/session');
const userModel = require('../model/user_model');
const checkLogin = require('../utils/check_login');

const { check, validationResult } = require('express-validator/check');

// 头像上传 multer storage
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.avatar_dir);
  },
  filename: function (req, file, cb) {
    cb(null, cuid());
  }
});

let avatarUploader = multer({
  storage,
  fileFilter (req, file, cb) {
    let fileExtname = path.extname(file.originalname);
    if (!config.image_allowed.includes(fileExtname))
      cb(null, false);
    else
      cb(null, true);
  },
  limits: {
    fileSize: 2048000
  }
});

let router = express.Router();

/**
 * 登录
 *
 * 1.从微信服务器获取openid，unionid和session_key
 * 2.根据openoid或unionid从数据库读取用户信息
 * 3.如果用户存在，设置session信息并返回sessionid
 * 4.如果用户不存在，执行注册程序，注册成功后设置session并返回sessionId
 */

router.post('/',
  [
    check('code', '缺少code参数').exists()
  ],
  (req, res) => {
    const validateError = validationResult(req);
    // 如果参数验证出错，返回
    if (!validateError.isEmpty()) {
      return res.status(422).send(validateError.mapped());
    }

    // 如果 req.session 不为空，删除存储在 redis 里的 session 信息
    if (req.session) {
      session.delete(req.session.id);
    }

    // 根据 code 获取 openid 和 unionid
    axios.get(config.authorization_url, {
      params: {
        appid: config.app_id,
        secret: config.app_secret,
        js_code: req.body.code,
        grant_type: 'authorization_code'
      }
    }).then(wxRes => {
      // 成功获取数据
      if (wxRes.data.errcode === undefined) {
        let id, idType;

        if (wxRes.data.unionid) {
          id = wxRes.data.unionid;
          idType = 'unionid';
        } else {
          id = wxRes.data.openid;
          idType = 'openid';
        }

        // 登录
        userModel.login(id, idType)
          .then(user => {
            // 用户存在
            let sessionId = uuid.v1()
            session.set(sessionId, {
              id: user.id,
              openid: user.openid,
              session_key: wxRes.data.session_key,
              role: "user"
            })
            res.send({ nickname: user.nickname, avatar: user.avatar, session_id: sessionId })
          })
          .catch((error) => {
            // 用户不存在，执行注册环节；注册成功后设置session，返回登录成功
            userModel.regist(wxRes.data.openid, wxRes.data.unionid)
              .then((user) => {
                let sessionId = uuid.v1()
                session.set(sessionId, {
                  id: user.id,
                  openid: user.openid,
                  session_key: wxRes.data.session_key,
                  role: "user" });

                  res.send({ nickname: user.nickname, avatar: user.avatar, session_id: sessionId });
              })
              // 注册失败
              .catch((error) => {
                res.status(500).send(error)
              })
          })
      }
      // 获取数据失败
      else {
        res.status(500).send(wxRes.data)
      }
    }).catch(error => {
      res.status(error.response.status).send(error.response.data)
    })
  }
)

/**
 * 注册（暂时用不到）
 */

router.put('/',
  [
    check('openid', '缺少openid参数').exists()
  ],
  (req, res) => {
    const validateError = validationResult(req)

    if (!validateError.isEmpty()) { return res.status(422).send(error.mapped()) }

    userModel.regist(req.body.openid, req.body.unionid)
      .then(user => {
        res.send(user)
      })
      .catch(error => {
        res.status(error.errcode).send(error)
      })
  }
)

/**
 * 更换头像
 * 1.验证用户是否登录，然后才能上传文件
 */
router.use("/changeAvatar", (req, res, next) => {
  if(!checkLogin(req))
    return res.status(401).send();
  else
    next();
})
router.post('/changeAvatar', avatarUploader.single('avatar'), (req, res) => {
  userModel.changeAvatar(req.session.id, req.file.filename)
    .then(result => {
      res.send({filename: req.file.filename})
    })
    .catch(error => {
      res.status(error.errcode).send(error)
    })
})

/**
 * 修改昵称
 */
router.post('/changeNickname',
  [
    check('nickname', '请输入新昵称')
  ],
  (req, res) => {
    // 检查是否登录
    if(!checkLogin(req))
      return res.status(401).send();

    try{
      validationResult(req);

      userModel.changeNickname(req.session.id, req.body.nickname)
      .then(result => {
        res.end();
      })
      .catch(error => {
        res.status(error.errcode).send(error)
      })
    }
    catch(error){
      res.status(422).send(error.mapped())
    }
  }
)

module.exports = router
