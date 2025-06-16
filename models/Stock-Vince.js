const database = require("mongoose");
const StockSchema = new database.Schema({
  symbol: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  likes: { type: Number, default: [] },
});

module.exports = database.model("Stock", StockSchema);
