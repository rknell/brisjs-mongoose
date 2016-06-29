var mongoose = require('mongoose');

var model = {
  name: String,
  price: Number,
  createdAt: {type: Date, default: new Date()}
};

var schema = new mongoose.Schema(model);
module.exports = mongoose.model('Widgets', schema);