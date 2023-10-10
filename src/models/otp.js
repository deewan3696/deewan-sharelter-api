const mongoose = require("mongoose");

const OtpsSchema = new mongoose.Schema(
  {
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
  }
);

const Otps = mongoose.model("otps", OtpsSchema);

module.exports = Otps;
