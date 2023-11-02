const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    user_id: {
      type: String,
      required: [true, "user_id is required"],
      unique: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, " surname is required"],
      trim: true,
      minLength: 3,
    },
    othernames: {
      type: String,
      required: [true, "othername is required"],
      trim: true,
      minLength: 3,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: [true, "User with the email already exists"],
      trim: true,
    },
    phone_number: {
      type: String,
      required: [true, "User phone number required"],
    },
    passwordHash: {
      type: String,
      required: [true, "passwordHash is required"],
    },
    passwordSalt: {
      type: String,
      required: [true, "passwordSalt is required"],
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },
    NIN: {
      type: String,
    },
    Address: {},
    Photo: {
      type: String,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "others"],
        message: "{VALUE} is not supported",
      },
    },
    BVN: {
      type: String,
    },
    is_BVN_Verified: {
      type: Boolean,
      default: false,
    },
    means_of_id: {
      type: String,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    is_agent: {
      type: Boolean,
      default: false,
    },
    
  },
  { timestamps: true }
);

const Users = model("Users", UserSchema);

module.exports = Users;
