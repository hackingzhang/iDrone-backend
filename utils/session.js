'use strict';

'use strict';

'use strict';

'use strict';

const redis = require("redis");
const config = require("../config/environment");

const redisClient = redis.createClient({
	host: config.redis_host,
	port: config.redis_port,
	password: config.redis_password,
	db: config.redis_db_session
});

let session = {
	set(key, value) {
		return new Promise((resolve, reject) => {
			redisClient.setex(key, config.session_expire_duration, 
				JSON.stringify(value), function (err, result) {
				if(err)
					reject(err);
				else
					resolve(result)
			});
		});
	},
	get(key) {
		return new Promise((resolve, reject) => {
			redisClient.get(key, function (err, result) {
				if(err)
					reject(err);
				else
					resolve(JSON.parse(result));
			});
		});
	},
	delete(key) {
		return new Promise((resolve, reject) => {
			redisClient.del(key, (err, result) => {
				if(err)
					reject(err);
				else
					resolve(result);
			});
		})
	}
};

module.exports = session;