'use strict';

'use strict';

'use strict';

'use strict';

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const {Order, Goods, User, GoodsInOrder} = require("../../utils/orm");
const orderModel = require("../../model/order_model");
const expect = chai.expect;

chai.use(chaiAsPromised);

describe("orderModel", function() {
	before("添加用户、商品", async function() {
		await User.create({
			id: "1",
			nickname: "qin",
			avatar: "avatar.png"
		});
		await User.create({
			id: "2",
			nickname: "qin",
			avatar: "avatar.png"
		});

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

		for(let i=0;i<20;i++){
			await Goods.create({
				id: 200 + i,
				image: "image.png",
				previews: "123123",
				title: `test goods${200 + i}`,
				price: 4599,
				sale: 1000,
				freight: 48,
				stock: 100,
				brief: `<h1>test goods ${i}</h1>`
			});
		}
	});
	
	describe("#add()", function() {
		it("应该成功创建订单,并返回刚创建的订单信息", function() {
			return expect(orderModel.add("1", [
				{id:"101", amount: 1}, 
				{id: "102", amount: 2}, 
				{id: "103", amount: 3}
			])).to.be.eventually.have.property("user_id").equal("1");
		});

		it("应该返回500数据库错误(输入错误的用户ID)", function() {
			return expect(orderModel.add("3", [
				{id:"101", amount: 1}, 
				{id: "102", amount: 2}, 
				{id: "103", amount: 3}
			])).to.be.eventually.rejected;
		});

		it("应该返回500数据库错误(输入错误的商品ID)", function() {
			return expect(orderModel.add("1", [
				{id:"101", amount: 1}, 
				{id: "102", amount: 2}, 
				{id: "1234", amount: 3}
			])).to.be.eventually.rejected;
		});

		afterEach("清空订单信息", async function() {
			await GoodsInOrder.destroy({ where: {} });
			await Order.destroy({ where: {} });
		});
	});

	describe("#get()", function() {

		it(`应返回一个订单信息`, async function() {
			let order = await orderModel.add("1", [
				{id:"101", amount: 1}, 
				{id: "102", amount: 2}, 
				{id: "103", amount: 3}
			]);
			return expect(orderModel.get(order.id)).to.be.eventually.have.property("id").equal(order.id);
		});

		it("应返回404订单不存在", function() {
			return expect(orderModel.get("12312334623451235")).to.be.eventually.rejected;
		});

		afterEach("清空订单信息", async function() {
			await GoodsInOrder.destroy({ where: {} });
			await Order.destroy({ where: {} });
		});
	});

	describe("#getListByUser()", function() {
		before("添加订单", async function() {
			for(let i=0;i<30;i++){
				order = await orderModel.add("1", [
					{id: "101", amount: 1}, 
					{id: "102", amount: 2}, 
					{id: "103", amount: 3}
				]);
			};
			
			for(let i=0;i<20;i++){
				order = await orderModel.add("2", [
					{id: "101", amount: 1}, 
					{id: "102", amount: 2}, 
					{id: "103", amount: 3}
				]);
			};
		});

		it("应该返回一个长度为30的订单列表", function() {
			return expect(orderModel.getListByUser("1", 1, 30)).to.be.eventually.a("array").with.lengthOf(30);
		});

		it("应该返回一个长度为24的订单列表", function() {
			return expect(orderModel.getListByUser("1")).to.be.eventually.a("array").with.lengthOf(24);
		});

		it("应该返回一个长度为10的订单列表", function() {
			return expect(orderModel.getListByUser("1", 2, 20)).to.be.eventually.a("array").with.lengthOf(10);
		});

		it("应该返回一个长度为20的订单列表", function() {
			return expect(orderModel.getListByUser("2")).to.be.eventually.a("array").with.lengthOf(20);
		});

		it("应该返回一个空数组", function() {
			return expect(orderModel.getListByUser("3")).to.be.eventually.a("array").with.lengthOf(0);
		});

		after("清空订单信息", async function() {
			await GoodsInOrder.destroy({ where: {} });
			await Order.destroy({ where: {} });
		});
	});

	describe("#getList()", function() {
		before("添加订单", async function() {
			for(let i=0;i<30;i++){
				await orderModel.add("1", [
					{id: "101", amount: 1}, 
					{id: "102", amount: 2}, 
					{id: "103", amount: 3}
				]);
			};
			
			for(let i=0;i<20;i++){
				await orderModel.add("2", [
					{id: "101", amount: 1}, 
					{id: "102", amount: 2}, 
					{id: "103", amount: 3}
				]);
			};
		});

		it("应该返回一个长度为30的订单列表", function() {
			return expect(orderModel.getList(1, 30)).to.be.eventually.a("array").with.lengthOf(30);
		});

		it("应该返回一个长度为24的订单列表", function() {
			return expect(orderModel.getList()).to.be.eventually.a("array").with.lengthOf(24);
		});

		it("应该返回一个长度为10的订单列表", function() {
			return expect(orderModel.getList(3, 20)).to.be.eventually.a("array").with.lengthOf(10);
		});

		it("应该返回一个空数组", function() {
			return expect(orderModel.getList(4, 20)).to.be.eventually.a("array").with.lengthOf(0);
		});

		after("清空订单信息", async function() {
			await GoodsInOrder.destroy({ where: {} });
			await Order.destroy({ where: {} });
		});
	});

	after("清除数据", async function() {
		await User.destroy({ where: {} });
		await Goods.destroy({ where: {} });
	});
});
