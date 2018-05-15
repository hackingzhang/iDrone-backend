const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const userModel = require("../../model/user_model");
const { User, Cart } = require("../../utils/orm");
const expect = chai.expect;

chai.use(chaiAsPromised);

afterEach("清空数据表", async function() {
	await User.destroy({ where: {} });
	await Cart.destroy({ where: {} });
});

describe("userModel", function() {
	describe("#regist()", function() {
		it("应返回刚注册的用户信息", function() {
			return expect(userModel.regist("123456", "123456")).to.eventually.have.property("openid").equal("123456");
		});

		it("应返回刚注册的用户信息", function() {
			return expect(userModel.regist("123456")).to.eventually.have.property("openid").equal("123456");
		});
	});

	describe("#login()", function() {
		it("应返回openid为 123456 的用户信息（按照用户ID查询）", async function() {
			let user = await userModel.regist("123456", "654321");
			return expect(userModel.login(user.id)).to.eventually.have.property("openid").equal("123456");
		});

		it("应返回openid为 123456 的用户信息", async function() {
			let user = await userModel.regist("123456", "654321");
			return expect(userModel.login(user.openid, "openid")).to.eventually.have.property("openid").equal("123456");
		});

		it("应返回ounionid为 654321 的用户信息", async function() {
			let user = await userModel.regist("123456", "654321");
			return expect(userModel.login(user.unionid, "unionid")).to.eventually.have.property("unionid").equal("654321");
		});
	});

	describe("#changeNickname()", function() {
		it("应该成功修改昵称", async function() {
			let user = await userModel.regist("123456", "654321");
			let result = await userModel.changeNickname(user.id, "qin");
			return expect(userModel.login(user.id)).to.eventually.have.property("nickname").equal("qin");
		});

		it("应返回404用户不存在", async function() {
			return expect(userModel.changeNickname("123456", 'qin')).to.be.rejected;
		})
	});

	describe("#changeAvatar()", function() {
		it("应该成功修改用户头像", async function() {
			let user = await userModel.regist("123456", "654321");
			let result = await userModel.changeAvatar(user.id, "avatar.jpg");
			return expect(userModel.login(user.id)).to.eventually.have.property("avatar").equal("avatar.jpg");
		});

		it("应该返回404用户不存在", async function() {
			return expect(userModel.changeAvatar("123456", 'qin')).to.be.rejected;
		});
	});
});