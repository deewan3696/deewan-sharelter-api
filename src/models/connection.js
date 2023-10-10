const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    connection_id: {
      type: String,
      required: [true, "connection_id is required"],
      unique: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    listing_id: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
  },
  { timestamps: true }
);
const Connection = mongoose.model("Connection", connectionSchema);

module.exports = Connection;
