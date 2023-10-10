const mongoose = require("mongoose");

const listingFeeSchema = new mongoose.Schema(
  {
    listing_fee_id: {
      type: String,
      unique: true,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    listing_description: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const ListingFee = mongoose.model("ListingFee", listingFeeSchema);
module.exports = ListingFee;

// To put .ListingDuration (to store the duration of the listing (e.g., 7 days, 30 days, 90 days, etc.),so that the price can be calculated )
// .BaseFee-(If applicable), a column to store the base fee for the listing type/listing description, which might be modified based on the duration.)

// 6.DurationMultiplier..(If the fee varies based on the duration, a column to store a multiplier that affects the base fee.)
