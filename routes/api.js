'use strict';

const fetch = require('node-fetch');
const Stock = require('../models/Stock');

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
    const symbol = req.query.stock?.toUpperCase();
    const like = req.query.like === 'true';
    const ip = req.ip || req.headers['x-forwarded-for'];

    if (!symbol) {
      return res.status(400).json({ error: 'Missing stock parameter' });
    }

    try {
      const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(500).json({ error: 'Failed to fetch stock data' });
      }

      const data = await response.json();

      let dbStock = await Stock.findOne({ symbol });
      if (!dbStock) {
        dbStock = new Stock({
          symbol,
          price: data.latestPrice,
          likedBy: like ? [ip] : []
         });
      } else {
          // Only add IP if like=true and not already liked
          if (like && !dbStock.likedBy.includes(ip)) {
            dbStock.likedBy.push(ip);
          }
          // Always update price
          dbStock.price = data.latestPrice;
      }

      await dbStock.save();

      res.json({
        stockData: {
          stock: dbStock.symbol,
          price: data.latestPrice,
          likes: dbStock.likedBy.length
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};
