const mongoose = require("mongoose");



const OtpsSchema = new mongoose.Schema({
    
  otp: {
    type: String,
    required: true,
  },
},
{ timestamps: true }
);

const Otps = mongoose.model("Users", UserSchema);

module.exports = Otps;