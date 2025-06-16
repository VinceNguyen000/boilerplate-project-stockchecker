"use strict";

const fetch = require("node-fetch");
const Stock = require("../models/stock.js");

module.exports = function (app) {
  app.route("/api/stock-prices").get(async function (req, res) {
    const symbol = req.query.stock;
    const apiUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
    const like = req.query.like === "true";
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";

    // console.log("Received request for stock symbol:", symbol);
    // console.log("API URL:", apiUrl);

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        return res.status(500).json({ error: "Failed to fetch stock data" });
      }

      const stockInfo = await response.json();
      let stock = await Stock.findOne({ symbol: stockInfo.symbol });
      if (!stock) {
        stock = new Stock({
          symbol: stockInfo.symbol,
          price: stockInfo.latestPrice,
          likes: [],
        });
      }
      if (like) {
        if (!stock.likes.includes(ip)) {
          stock.likes.push(ip);
          stock.likes = [...new Set(stock.likes)]; // Ensure likes are unique
        }
      }

      res.json({
        stockData: {
          stock: stockInfo.symbol,
          price: stockInfo.latestPrice,
          likes: stock.likes.length,
        },
      });
    } catch (error) {
      console.error("Fetch failed:", error);
      res.status(500).json({ error: "Stock data fetch failed" });
    }
  });
};
