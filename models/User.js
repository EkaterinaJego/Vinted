const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    unique: true,
    type: String,
  },
  account: {
    username: {
      required: true,
      type: String,
    },
    phone: String,
  },
  token: String,
  hash: String,
  salt: String,
  // avatar: { type: mongoose.Schema.Types.Mixed, default: {} },
  avatar: Object,
});

module.exports = User;
