const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const {Cart, Goods, User, GoodsInCart} = require("../../utils/orm");
const cartModel = require("../../model/cart_model");
const userModel = require("../../model/user_model");
const expect = chai.expect;

chai.use(chaiAsPromised);

describe("cartModel", function() {
	before("添加用户、商品", async function() {
		await User.create({ id: "1" });
		await Cart.create({ id: "1", user_id: "1" });

		for(let i=0;i<30;i++){
			await Goods.create({
				id: 100 + i,
				image: "image.png",
				previews: "123123",
				title: `test goods${100 + i}`,
				price: 4599,
				sale: 1000,
				freight: 48,
				stock: 100,
				brief: `<h1>test goods ${i}</h1>`
			});
		}
	});

	describe("#get()", function() {
		it("应该返回包含0条商品信息的cart对象", function() {
			return expect(
				cartModel.get("1")
			).to.be.eventually.have.property("goods").a("array").have.lengthOf(0);
		});

		it("应该返回包含3条商品信息的cart对象", async function() {
			await cartModel.addGoods("1", "101", 1);
			await cartModel.addGoods("1", "102", 2);
			await cartModel.addGoods("1", "103", 3);
			return expect(
				cartModel.get("1")
			).to.be.eventually.have.property("goods").a("array").have.lengthOf(3);
		});

		it("应该返回404用户不存在(输入错误的用户ID)", function() {
			return expect(
				cartModel.get("12345")
			).to.be.eventually.rejected.with.property("errcode").equal(404);
		});

		afterEach("清空购物车", async function() {
			await GoodsInCart.destroy({ where: {} });
		});
	});

	describe("#addGoods()", function() {
		it(`#addGoods("123", "101", 1)`, async function() {
			return expect(cartModel.addGoods("1", "101", 1)).to.be.eventually.fulfilled;
		});
		it(`#addGoods("123", "101", 1)应该返回404用户不存在`, async function() {
			return expect(
				cartModel.addGoods("123", "101", 1)
			).to.be.eventually.rejected.with.property("errcode").equal(404);
		});
		it(`#addGoods("1", "1237878", 1)应该返回500数据库错误`, async function() {
			return expect(
				cartModel.addGoods("1", "1237878", 1)
			).to.be.eventually.rejected.with.property("errcode").equal(500);
		});

		afterEach("清空订单信息", async function() {
			await GoodsInCart.destroy({ where: {} });
		});
	});

	describe("#removeGoods()", function() {
		before("添加订单", async function() {
			await cartModel.addGoods("1", "101", 1);
			await cartModel.addGoods("1", "102", 2);
		});

		it("#removeGoods('1', 101')应该返回1", function() {
			return expect(cartModel.removeGoods('1', '101')).to.be.eventually.equal(1)
		});

		it("#removeGoods('1', '101')应该返回0", function() {
			return expect(cartModel.removeGoods('1', '101')).to.be.eventually.equal(0);
		});

		after("清空订单信息", async function() {
			await GoodsInCart.destroy({ where: {} });
		});
	});

	after("清除数据", async function() {
		await Cart.destroy({ where: {} });
		await User.destroy({ where: {} });
		await Goods.destroy({ where: {} });
	});
});