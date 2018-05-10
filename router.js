'use strict';

'use strict';

'use strict';

'use strict';

const user = require('./controller/user_controller')
const cart = require('./controller/cart_controller')
const video = require('./controller/video_controller')
const goods = require('./controller/goods_controller')
const order = require('./controller/order_controller')

module.exports = function (app) {
  app.use('/user', user)
  app.use('/cart', cart)
  app.use('/video', video)
  app.use('/goods', goods)
  app.use('/order', order)
}
