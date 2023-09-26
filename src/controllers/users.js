const { findQuery,insertOne } = require("../repository");
const { hashMyPassword, generateOTP,generateReferralCode } = require("../utils/index");
const redis = require("redis");
const {readFileAndSendEmail}= require("../services/email")
const { redisClient } = require('../config/redis')





const create = async (req, res, next) => {
  const { lastname, othernames, email, phone_number, password, referrer_code } = req.body;

   


  try {
    const user = await findQuery("Users", { email: email });
    if (user.length > 0) {
      const err = new Error("User already exists");
      err.status = 400;
      return next(err);
    }

    const passwordhash = await hashMyPassword(password);
     const referCode = generateReferralCode();
    const createUser = {
      lastname,
      othernames,
      email,
      phone_number,
      referrer_code:referCode,
      passwordhash: passwordhash[0],
      passwordSalt: passwordhash[1],
    };

    await insertOne("Users", createUser);

    const _otp = generateOTP();

    const otpModel = {
      email: createUser.email,
      otp: _otp,
    };
    redisClient.set(`${createUser.email}`, JSON.stringify(_otp), {
      EX: 60 * 3, //seconds
      //NX: true,
    });
    await insertOne("otps", otpModel);

    //readFileAndSendEmail(email,"OTP",` Hello  ${lastname} ${othernames},\n Your OTP is ${_otp}`);

    res.status(201).json({
      status: true,
      message: "Account created",
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
};
