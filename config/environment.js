/*jslint es6 */
/*jslint node: true */

'use strict';

const path = require('path');

const config = {
/**
 * 运行模式
 * debug不使用https
 * product将使用https
 */
    mode: "product",
    // mode: "product",
/**
 * express监听端口
 */
    port: 80,
    https_port: 443,

/**
 * HTTPS设置
 */
    https_key_file: path.resolve(__dirname, "../https/domain.key"),
    https_cert_file: path.resolve(__dirname, "../https/domain.cert"),

/**
 * 微信相关设置
 */

    app_id: "",
    app_secret: "",
    authorization_url: `https://api.weixin.qq.com/sns/jscode2session?grant_type=authorization_code`,

/**
 * 目录配置
 */

    // 临时文件目录
    tmp_dir: path.resolve(__dirname, '../tmp'),
    // 视频文件目录
    video_dir: path.resolve(__dirname, '../public/videos'),
    // 视频封面目录
    video_cover_dir: path.resolve(__dirname, '../public/images/video_cover'),
    // 头像目录
    avatar_dir: path.resolve(__dirname, '../public/images/avatar'),
    // 商品封面图
    goods_cover_dir: path.resolve(__dirname, '../public/images/goods/cover'),
    // 商品预览图
    goods_preview_dir: path.resolve(__dirname, '../public/images/goods/preview'),
    // 商品简介
    goods_brief_dir: path.resolve(__dirname, '../public/brief'),
    // 简介图片
    goods_brief_image_dir: path.resolve(__dirname, '../public/images/goods/brief'),

/**
 * 文件上传配置
 */

    // 支持上传的图片扩展名
    image_allowed: [
        '.jpg',
        '.png',
        '.gif',
        '.jpeg'
    ],
    // 支持上传的视频扩展名
    video_allowed: [
        '.mp4'
    ],
    // 头像图片限制 2MB 大小
    avatar_size_limit: 2097152,
    // 视频封面图限制 2MB 大小
    video_cover_limit: 2097152,
    // 商品封面图限制 2MB 大小
    goods_cover_limit: 2097152,
    // 商品预览图限制 4MB 大小
    goods_preview_limit: 4194304,
    // 商品简介内图限制 4MB 大小
    goods_brief_limit: 4194304,
    // 其他图片显示 10MB 大小
    image_size_limit: 10485760,
    // 视频上传限制 1GB 大小
    video_size_limit: 1073741824,

/**
 * redis 配置
 */

    redis_host: "127.0.0.1",
    redis_port: "6379",
    redis_password: 'xinyu',
    redis_db_session: 0,

/**
 * session 配置
 */
    // session 过期时间，单位秒（s）
    session_expire_duration: 60 * 30,

/**
 * 数据库配置
 */

    db_host: "127.0.0.1",
    db_port: "3306",
    db_type: 'mysql',
    db_database: 'idrone',
    db_username: 'idrone',
    db_password: 'xinyu',

    db_pool_max: '40',
    db_pool_min: '5'
};

module.exports = config;
