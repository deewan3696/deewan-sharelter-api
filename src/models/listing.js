const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    listing_id: {
      type: String,
      required: [true, "listing_id is required"],
      unique: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    admin_id: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    number_of_listing: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    photo_url: {
      type: String,
      required: true,
    },
    price: {
      type: String,
    },
    listing_types: {
      type: String,
      enum: ["HOSTEL", "APARTMENTS"],
      required: true,
    },
    occupancy_limit: {
      type: Number,
      required: true,
    },
    is_approved: {
      type: Boolean,
      default: false,
    },
    comments: {
      type: String,
    },
  },
  { timestamps: true }
);
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
