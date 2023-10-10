const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    card_id: {
      type: String,
      unique: true,
      required: true,
    },
    card_name: {
      type: String,
      unique: true,
      required: true,
    },
    card_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bank: {
      type: String,
      required: true,
    },

    card_type: {
      type: String,
      enum: {
        values: ["MASTERCARD", "VERVE", "VISA"],
        message: "{VALUE} is not supported",
      },
    },
  },
  { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema);
module.exports = Card;
