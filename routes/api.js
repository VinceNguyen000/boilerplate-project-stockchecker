"use strict";

const fetch = require("node-fetch");
const Stock = require("../models/Stock");

module.exports = function (app) {
  app.route("/api/stock-prices").get(async function (req, res) {
    console.log("Query params:", req.query);

    let stocks = req.query.stock;
    const like = req.query.like === "true";
    const ip = req.ip || req.headers["x-forwarded-for"];

    if (!stocks) {
      return res.status(400).json({ error: "Missing stock parameter" });
    }

    if (Array.isArray(stocks)) {
      stocks = stocks.map((s) => String(s).toUpperCase());
    } else {
      stocks = [String(stocks).toUpperCase()];
    }

    try {
      if (stocks.length === 1) {
        const data = await handleSingleStock(stocks[0], like, ip);
        return res.json({ stockData: data });
      } else if (stocks.length === 2) {
        const [stock1, stock2] = await Promise.all([
          handleSingleStock(stocks[0], like, ip),
          handleSingleStock(stocks[1], like, ip),
        ]);

        const relLikes1 = stock1.likes - stock2.likes;
        const relLikes2 = stock2.likes - stock1.likes;

        return res.json({
          stockData: [
            { stock: stock1.stock, price: stock1.price, rel_likes: relLikes1 },
            { stock: stock2.stock, price: stock2.price, rel_likes: relLikes2 },
          ],
        });
      } else {
        return res
          .status(400)
          .json({ error: "Only one or two stocks allowed" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};

// ✅ Helper function to fetch and update one stock
async function handleSingleStock(symbol, like, ip) {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch stock data for ${symbol}`);
  }

  const data = await response.json();
  const price = data.latestPrice;

  let stock = await Stock.findOne({ symbol });
  if (!stock) {
    stock = new Stock({
      symbol,
      price,
      likedBy: like ? [ip] : [],
    });
  } else {
    // Update price and optionally add like
    stock.price = price;
    if (like && !stock.likedBy.includes(ip)) {
      stock.likedBy.push(ip);
    }
  }

  await stock.save();

  return {
    stock: stock.symbol,
    price,
    likes: stock.likedBy.length,
  };
}
