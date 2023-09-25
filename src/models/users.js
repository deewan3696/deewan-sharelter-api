const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  lastname: {
    type: String,
    required: true,
  },
  othernames: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
  },
  passwordSalt: {
    type: String,
  },
  referrer_code: {
    type: String,
  },
});

const Users = mongoose.model("Users", UserSchema);

module.exports = Users;
