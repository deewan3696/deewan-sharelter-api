const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    payment_id: {
      type: String,
      required: [true, "payment_id is required"],
      unique: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    listing_fee_id: {
      type: Schema.Types.ObjectId,
      ref: "listingFee",
      required: true,
    },
    payment_type: {
      type: String,
      enum: ["CARD", "BANK TRANSFER"],
      required: true,
    },
    payment_reference: {
      type: String,
    },
  },
  { timestamps: true }
);
const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
