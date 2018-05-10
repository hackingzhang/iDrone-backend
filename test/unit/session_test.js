'use strict';

'use strict';

'use strict';

'use strict';

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
const redis = require('redis');
const session = require("../../utils/session");
const config = require("../../config/environment");

const redisClient = redis.createClient({
	host: config.redis_host,
	port: config.redis_port,
	password: config.redis_password,
	db: config.redis_db_session
});

chai.use(chaiAsPromised);

describe("session", function() {
  describe("#set", function() {
    it("#set('key', Object)应该返回OK", function() {
      return expect(session.set("key", {id: '123456', openid: '123456'})).to.be.eventually.equal("OK");
    });

    it("#set('key', String)应该返回OK", function() {
      return expect(session.set("key", "123456")).to.be.eventually.equal("OK");
    });

    it("#set('key', Array)应该返回OK", function() {
      return expect(session.set("key", ["123", "456"])).to.be.eventually.equal("OK");
    })

    afterEach("清空redis", function(done) {
      redisClient.flushall((err, result) => {
        done(err);
      });
    });
  });

  describe("#get", function() {
    before("redis.set('session_id')", async function() {
      await session.set("session_id", {id: '123456', openid: '654321', unionid: '123123123'});
    });

    it("#get('session_id')应该返回包含值为123456的id属性的对象", function() {
      return expect(session.get("session_id")).to.be.eventually.have.property("id").equal("123456");
    });

    it("#get('session')应该返回null", function() {
      return expect(session.get("session")).to.be.eventually.equal(null);
    });

    after("清空redis", function(done) {
      redisClient.flushall((err, result) => {
        done(err);
      });
    });
  });
});
