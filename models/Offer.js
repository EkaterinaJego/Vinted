const mongoose = require('mongoose');
const User = require("./User");

const Offer = mongoose.model("Offer", {
  product_name: {
  type : String,
  maxLength: [50, "Title is too long, maximum size is 50 caracteres, got more."]},
  product_description: {
  type : String,
  maxLength: [500, "Description is too long, maximum size is 500 caracters, got more."]},
  product_price: { 
  type : Number,
  max : [100000, "Maximum price is 100000, got {VALUE}."]
  },
  product_details: Array,
  product_image: { type: mongoose.Schema.Types.Mixed, default: {} },
  owner: {
      type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      });
    module.exports = Offer;   