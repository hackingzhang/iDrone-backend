/*jslint es6 */
/*jslint node: true */

'use strict';

const Sequelize = require('sequelize');
const config = require('../config/environment');

const dataTypes = Sequelize.DataTypes;

const sequelize = new Sequelize({
  dialect: config.db_type,
  host: config.db_host,
  port: config.db_port,
  database: config.db_database,
  username: config.db_username,
  password: config.db_password,
  logging: (log) => {},
  pool: {
    min: config.db_pool_min,
    max: config.db_pool_max
  }
})

/**
 * 用户信息表
 */

let User = sequelize.define('user',
  {
    id: {
      type: dataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      comment: '用户ID'
    },
    nickname: {
      type: dataTypes.STRING(32),
      allowNull: true,
      comment: '昵称'
    },
    avatar: {
      type: dataTypes.STRING(1024),
      allowNull: true,
      comment: '头像'
    },
    openid: {
      type: dataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    unionid: {
      type: dataTypes.STRING,
      allowNull: true,
      defaultValue: null
    }
  }, {
    underscored: true,
    indexes: [
      {
        fields: ['nickname']
      },
      {
        type: 'UNIQUE',
        fields: ['openid']
      },
      {
        type: 'UNIQUE',
        fields: ['unionid']
      }
    ]
  }
)

/**
 *	视频信息表
 */

let Video = sequelize.define('video',
  {
    id: {
      type: dataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      comment: '视频ID'
    },
    title: {
      type: dataTypes.STRING,
      allowNull: false,
      comment: '标题'
    },
    source: {
      type: dataTypes.TEXT,
      allowNull: false,
      comment: '视频地址'
    },
    cover: {
      type: dataTypes.TEXT,
      allowNull: false,
      comment: '视频封面'
    },
    upload_at: {
      type: dataTypes.DATE,
      allowNull: false,
      defaultValue: dataTypes.NOW,
      comment: '上传时间'
    }
  },
  {
    underscored: true,
    indexes: [
      {
        type: 'FULLTEXT',
        fields: ['title']
      }
    ]
  }
)

Video.belongsTo(User)
User.hasMany(Video)

/**
 * 商品分类表
 */

let GoodsCategory = sequelize.define('goods_category',
  {
    id: {
      type: dataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      comment: '分类ID'
    },
    title: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '分类名称'
    }
  }, {
    underscored: true
  }
)

/**
 * 商品表
 */

let Goods = sequelize.define('goods',
  {
    id: {
      type: dataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      comment: '商品ID'
    },
    image: {
      type: dataTypes.TEXT,
      allowNull: false,
      comment: '商品图(商品列表时显示)'
    },
    previews: {
      type: dataTypes.TEXT,
      allowNull: false,
      comment: '预览图'
    },
    title: {
      type: dataTypes.STRING,
      allowNull: false,
      comment: '名称'
    },
    price: {
      type: dataTypes.DECIMAL,
      allowNull: false,
      comment: '价格'
    },
    sale: {
      type: dataTypes.INTEGER,
      allowNull: false,
      comment: '销量'
    },
    stock: {
      type: dataTypes.INTEGER,
      allowNull: false,
      comment: '库存'
    },
    freight: {
      type: dataTypes.DECIMAL,
      allowNull: false,
      comment: '运费'
    },
    brief: {
      type: dataTypes.STRING(36),
      allowNull: true,
      comment: '简介'
    }
  },
  {
    underscored: true,
    name: {
      singular: 'goods',
      plural: 'goods'
    },
    indexes: [
      {
        type: 'FULLTEXT',
        fields: ['title']
      }
    ]
  }
)

Goods.belongsTo(GoodsCategory, { as: 'category' })

/**
 * 购物车表
 *
 * 购物车表与用户表为 1:1 关系
 * 与商品表为 m:n 关系
 */

let Cart = sequelize.define('cart',
  {
    id: {
      type: dataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      comment: '购物车ID'
    }
  }, {
    underscored: true
  }
)

// 该表为【购物车表】与【商品表】多对多关系的中间表
let GoodsInCart = sequelize.define('goods_in_cart',
  {
    amount: {
      type: dataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '数量'
    }
  },
  {
    underscored: true
  }
)

Cart.belongsTo(User)
User.hasOne(Cart)
Cart.belongsToMany(Goods, { through: GoodsInCart })
Goods.belongsToMany(Cart, { through: GoodsInCart })

/**
 * 订单表
 *
 * 【订单表】与【用户表】为 1:n 关系，一个用户对应多个订单
 * 与【商品表】为 m:n 关系
 */

let Order = sequelize.define('order',
  {
    id: {
      type: dataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      comment: '订单编号'
    },
    status: {
      type: dataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '订单状态：0 未付款；1 已付款；2 已发货；3 已完成；-1 已取消'
    },
    created_at: {
      type: dataTypes.DATE,
      allowNull: false,
      defaultValue: dataTypes.NOW
    }
  }, {
    underscored: true
  }
)

/**
 * 该表为【订单表】与【商品表】之间多对多关系的中间表
 */
let GoodsInOrder = sequelize.define('goods_in_order',
  {
    amount: {
      type: dataTypes.CHAR(36),
      allowNull: false,
      defaultValue: 1,
      comment: '商品数量'
    }
  },
  {
    underscored: true
  }
);

Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Goods, { through: GoodsInOrder });
Goods.belongsToMany(Order, { through: GoodsInOrder });

/**
 * 收藏夹
 */

Video.belongsToMany(User, { as: 'UserWhoLikeMe', through: 'favorite_video' });
User.belongsToMany(Video, { as: 'FavoriteVideos', through: 'favorite_video' });

Goods.belongsToMany(User, { as: 'UserWhoLikeMe', through: 'favorite_goods' });
User.belongsToMany(Goods, { as: 'FavoriteGoods', through: 'favorite_goods' });

// 建表
sequelize.sync();

module.exports = {
  sequelize,
  User,
  Video,
  GoodsCategory,
  Goods,
  Cart,
  Order,
  GoodsInCart,
  GoodsInOrder
};
