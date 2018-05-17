const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const {Goods, GoodsCategory} = require("../../utils/orm");
const goodsModel = require("../../model/goods_model");
const expect = chai.expect;

chai.use(chaiAsPromised);

describe("goodsModel", function() {
	before("添加商品分类", async function() {
		await GoodsCategory.create({
			id: "1",
			title: "固定翼"
		});
	
		await GoodsCategory.create({
			id: "2",
			title: "多旋翼"
		});
	});
	describe("#add()", function() {
		it("应该返回刚添加的商品信息", function() {
			return expect(
				goodsModel.add("固定翼FPV",
					"5999",
					"123",
					"456",
					"24",
					"https://hackingzhang.tech/cover.jpg",
					"/img/1.jpg|/img/1.jpg|/img/1.jpg",
					"<h1>固定翼FPV</h1>",
					"1")
				).to.be.eventually.have.property("title").equal("固定翼FPV");
		});
	});

	describe("#get()", function() {
		let goods1 = null,
			goods2 = null;

		before("添加商品", async function() {
			goods1 = await goodsModel.add("固定翼FPV",
				"5999",
				"123",
				"456",
				"24",
				"https://hackingzhang.tech/cover.jpg",
				"/img/1.jpg|/img/1.jpg|/img/1.jpg",
				"<h1>固定翼FPV</h1>",
				"1"
			);

			goods2 = await goodsModel.add("竞速四旋翼",
				"5999",
				"123",
				"456",
				"24",
				"https://hackingzhang.tech/cover.jpg",
				"/img/1.jpg|/img/1.jpg|/img/1.jpg",
				"<h1>竞速四旋翼</h1>",
				"1"
			);
		});

		it("应该返回title为“固定翼FPV”的商品信息", function() {
			return expect(
				goodsModel.get(goods1.id)
			).to.be.eventually.have.property("title").equal("固定翼FPV");
		});

		it("应该返回title为“竞速四旋翼”的商品信息", function() {
			return expect(
				goodsModel.get(goods2.id)
			).to.be.eventually.have.property("title").equal("竞速四旋翼");
		});

		it("应返回404商品不存在", function() {
			return expect(goodsModel.get("453453")).to.be.rejected;
		});

		after("清除商品", async function() {
			await Goods.destroy({ where: {} });
		});
	});

	describe("#getListByCategory()", function() {
		before("添加商品", async function() {
			for(let i=0;i<30;i++){
				await goodsModel.add("固定翼FPV",
					"5999",
					"123",
					"456",
					"24",
					"https://hackingzhang.tech/cover.jpg",
					"/img/1.jpg|/img/1.jpg|/img/1.jpg",
					"<h1>固定翼FPV</h1>",
					"1"
				);
			};

			for(i=0;i<30;i++){
				await goodsModel.add("竞速四旋翼",
					"5999",
					"123",
					"456",
					"24",
					"https://hackingzhang.tech/cover.jpg",
					"/img/1.jpg|/img/1.jpg|/img/1.jpg",
					"<h1>竞速四旋翼</h1>",
					"2"
				);
			};
		});

		it("应返回包含30个商品信息的数组", function() {
			return expect(
				goodsModel.getListByCategory("1", 1, 30)
			).to.be.eventually.a("array").have.lengthOf(30);
		});

		it("应返回包含30个商品信息的数组", function() {
			return expect(
				goodsModel.getListByCategory("2", 1, 30)
			).to.be.eventually.a("array").have.lengthOf(30);
		});

		it("应返回包含10个商品信息的数组", function() {
			return expect(
				goodsModel.getListByCategory("2", 2, 20)
			).to.be.eventually.a("array").have.lengthOf(10);
		});

		it("应返回空数组", function() {
			return expect(
				goodsModel.getListByCategory("3")
			).to.be.eventually.a("array").have.lengthOf(0);
		});

		after("清除商品", async function() {
			await Goods.destroy({ where: {} });
		});
	});

	describe("#search()", function() {
		before("添加商品", async function() {
			for(let i=0;i<30;i++){
				await goodsModel.add("固定翼FPV",
					"5999",
					"123",
					"456",
					"24",
					"https://hackingzhang.tech/cover.jpg",
					"/img/1.jpg|/img/1.jpg|/img/1.jpg",
					"<h1>固定翼FPV</h1>",
					"1"
				);
			};
			for(i=0;i<30;i++){
				await goodsModel.add("竞速四旋翼",
					"5999",
					"123",
					"456",
					"24",
					"https://hackingzhang.tech/cover.jpg",
					"/img/1.jpg|/img/1.jpg|/img/1.jpg",
					"<h1>竞速四旋翼</h1>",
					"2"
				);
			};
		});

		it("应返回包含30个商品信息的数组", function() {
			return expect(goodsModel.search("固定翼", 1, 40)).to.be.eventually.a("array").have.lengthOf(30);
		});

		it("应返回包含30个商品信息的数组", function() {
			return expect(goodsModel.search("四旋翼", 1, 40)).to.be.eventually.a("array").have.lengthOf(30);
		});

		it("应返回空数组", function() {
			return expect(goodsModel.search("炸鸡")).to.be.eventually.a("array").have.lengthOf(0);
		});

		after("清除商品", async function() {
			await Goods.destroy({ where: {} });
		});
	});

	describe("#search()", function() {
		before("添加商品", async function() {
			for(let i=0;i<30;i++){
				await goodsModel.add("固定翼FPV",
					"5999",
					"123",
					"456",
					"24",
					"https://hackingzhang.tech/cover.jpg",
					"/img/1.jpg|/img/1.jpg|/img/1.jpg",
					"<h1>固定翼FPV</h1>",
					"1"
				);
			};
		});

		it("应返回包含30个商品信息的数组", function() {
			return expect(goodsModel.search("固定翼", 1, 40)).to.be.eventually.a("array").have.lengthOf(30);
		});

		it("应返回空数组", function() {
			return expect(goodsModel.search("炸鸡")).to.be.eventually.a("array").have.lengthOf(0);
		});

		after("清除商品", async function() {
			await Goods.destroy({ where: {} });
		});
	});
	after("清除商品分类", function() {
		GoodsCategory.destroy({ where: {} });
	});
});