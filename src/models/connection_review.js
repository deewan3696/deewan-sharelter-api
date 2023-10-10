const mongoose = require("mongoose");

const connectionReviewSchema = new mongoose.Schema(
  {
    connection_review_id: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    connection_id: {
      type: Schema.Types.ObjectId,
      ref: "Connection",
    },

    comments: {
      type: String,
      required: true,
    },
    ratings: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ConnectionReview = mongoose.model("connectionReview", connectionReviewSchema);

module.exports = ConnectionReview;
