const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const {Video, User} = require("../../utils/orm");
const videoModel = require("../../model/video_model");
const expect = chai.expect;

chai.use(chaiAsPromised);

describe("videoModel", function() {
	before("添加用户", async function() {
		await User.create({ id: "123456" });
		await User.create({ id: "654321" });
	});

	describe("#add()", function() {
		it("应该返回刚添加的视频信息", function() {
			return expect(
				videoModel.add("test video", 
					"https://hackingzhang.tech/video.mp4", 
					"123456")
				).to.be.eventually.have.property("title").equal("test video");
		});

		it("应返回500数据库错误", function() {
			return expect(
				videoModel.add("test video", 
					"https://hackingzhang.tech/video.mp4",
					"cover.jpg",
					"123123")
				).to.be.eventually.rejected;
		});
	});

	describe("#get()", function() {
		let video = null;

		before("添加视频", async function() {
			video = await videoModel.add("test video", "https://hackingzhang.tech/video.mp4", "cover.jpg", "123456");
		});

		it("应返回title为test video的视频信息", async function() {
			return expect(videoModel.get(video.id)).to.be.eventually.have.property("title").equal("test video");
		});

		it("应返回404视频信息不存在", async function() {
			return expect(videoModel.get("123123345748")).to.be.rejected;
		});

		after("清除视频", async function() {
			await Video.destroy({ where: {} });
		});
	});

	describe("#getListByUser", function() {
		before("添加视频", async function() {
			for(let i=0;i<40;i++){
				await videoModel.add(`test video${i} of 123456`, "https://hackingzhang.tech/video.mp4", "cover.jpg", "123456");
			}

			for(i=0;i<20;i++){
				await videoModel.add(`test video${i} of 654321`, "https://hackingzhang.tech/video.mp4", "cover.jpg", "654321");
			}
		});

		it("应返回一个video数组，且数组长度为40", function() {
			return expect(videoModel.getListByUser("123456", 1, 40)).to.be.eventually.a("array").have.lengthOf(40);
		});

		it("应返回一个video数组，且数组长度为24", function() {
			return expect(videoModel.getListByUser("123456")).to.be.eventually.a("array").have.lengthOf(24);
		});

		it("应返回一个video数组，且数组长度为20", function() {
			return expect(videoModel.getListByUser("654321")).to.be.eventually.a("array").have.lengthOf(20);
		});

		it("应返回一个空数组", function () {
			return expect(videoModel.getListByUser("123123")).to.be.eventually.a("array").have.lengthOf(0);
		});

		after("清除视频", async function() {
			await Video.destroy({ where: {} });
		});
	});

	describe("#getList", function() {
		before("添加视频", async function() {
			for(let i=0;i<40;i++){
				await videoModel.add(`test video${i} of 123456`, "https://hackingzhang.tech/video.mp4", "cover.jpg", "123456");
			}
		});

		it("应返回一个video数组，且数组长度为40", function() {
			return expect(videoModel.getList(1, 40)).to.be.eventually.a("array").have.lengthOf(40);
		});

		it("应返回一个video数组，且数组长度为20", function() {
			return expect(videoModel.getList(2, 20)).to.be.eventually.a("array").have.lengthOf(20);
		});

		after("清除视频", async function() {
			await Video.destroy({ where: {} });
		});
	});

	describe("#search", function() {
		before("添加视频", async function() {
			for(let i=0;i<40;i++){
				await videoModel.add(`FPV第一人称固定翼飞行视频${i}`, "https://hackingzhang.tech/video.mp4", "cover.jpg", "123456");
			}
		});

		it("应返回一个video数组，且数组长度为40", function() {
			return expect(videoModel.search("固定翼", 1, 40)).to.be.eventually.a("array").have.lengthOf(40);
		});

		it("应返回一个video数组，且数组长度为24", function() {
			return expect(videoModel.search("固定翼")).to.be.eventually.a("array").have.lengthOf(24);
		});

		it("应返回一个空数组", function() {
			return expect(videoModel.search("四旋翼")).to.be.eventually.a("array").have.lengthOf(0);
		});

		after("清除视频", async function() {
			await Video.destroy({ where: {} });
		});
	});

	after("清除用户", function() {
		User.destroy({ where: {} });
	});
});