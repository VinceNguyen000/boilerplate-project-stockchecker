const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

describe("Functional Tests", function () {
  //this.timeout(5000); // Set a timeout for the tests

  it("Viewing one stock: GET request to /api/stock-prices/", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: "GOOG", like: "false" })
      .end(function (err, res) {
        //console.log("res.body: ", res.body);

        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "stockData");

        const stockData = res.body.stockData;
        assert.isObject(stockData);
        assert.property(stockData, "stock");
        assert.property(stockData, "price");
        assert.property(stockData, "likes");
        assert.equal(stockData.stock, "GOOG");
        assert.isNumber(stockData.price);
        assert.isNumber(stockData.likes);
        done();
      });
  });

  it("Viewing one stock and liking it: GET request to /api/stock-prices/", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: "GOOG", like: "true" })
      .end(function (err, res) {   
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "stockData");

        const stockData = res.body.stockData;
        assert.isObject(stockData);
        assert.property(stockData, "stock");
        assert.property(stockData, "price");
        assert.property(stockData, "likes");
        assert.equal(stockData.stock, "GOOG");
        assert.isNumber(stockData.price);
        assert.isNumber(stockData.likes);
        done();
      });
  });

  it("Viewing the same stock again and liking it again: GET request to /api/stock-prices/", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: "GOOG", like: "true" })
      .end(function (err, res) {
        console.log("res.body: ", res.body);

        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "stockData");

        const stockData = res.body.stockData;
        assert.isObject(stockData);
        assert.property(stockData, "stock");
        assert.property(stockData, "price");
        assert.property(stockData, "likes");
        assert.equal(stockData.stock, "GOOG");
        assert.isNumber(stockData.price);
        assert.isNumber(stockData.likes);
        done();
      });
  });

  it("Viewing two stocks: GET request to /api/stock-prices/", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: ["AAPL", "MSFT"], like: "false" })
      .end(function (err, res) {
        console.log("res.body: ", res.body);

        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "stockData");

        const stockData = res.body.stockData;
        assert.isArray(stockData);
        assert.lengthOf(stockData, 2);

        stockData.forEach((data) => {
          assert.isObject(data);
          assert.property(data, "stock");
          assert.property(data, "price");
          assert.property(data, "rel_likes");
          assert.isString(data.stock);
          assert.isNumber(data.price);
          assert.isNumber(data.rel_likes);
        });

        done();
      });
  });

  it("Viewing two stocks and liking one of them: GET request to /api/stock-prices/", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: ["AAPL", "MSFT"], like: "true" })
      .end(function (err, res) {
        console.log("res.body: ", res.body);

        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "stockData");

        const stockData = res.body.stockData;
        assert.isArray(stockData);
        assert.lengthOf(stockData, 2);

        stockData.forEach((data) => {
          assert.isObject(data);
          assert.property(data, "stock");
          assert.property(data, "price");
          assert.property(data, "rel_likes");
          assert.isString(data.stock);
          assert.isNumber(data.price);
          assert.isNumber(data.rel_likes);
        });

        done();
      });
  });
});
