require("dotenv").config();
const {
  findQuery,
  insertOne,
  find,
  deleteOne,
  updateOne,
} = require("../repository");
const {
  hashMyPassword,
  generateOTP,
  generateReferralCode,
  comparePassword,
  isEmpty,
} = require("../utils/index");
//const redis = require("redis");
const { readFileAndSendEmail } = require("../services/email");
const { redisClient } = require("../config/redis");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const {
  CustomerCreated,
  resetCustomerPasswordSuccessful,
  CustomerExist,
  InvalidCredentials,
  invalidPhone,
  EmailHasNotBeenVerified,
  OtpMismatch,
  OtpResentSuccessfully,
  EmailVerificationSuccessful,
  LoginSuccessful,
} = require("../constants/messages");
const logger = require("../config/logger");

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const checkEmail = await findQuery("Users", { email: email });

    //console.log("checkEmail:", checkEmail);

    if (isEmpty(checkEmail)) throw new Error(InvalidCredentials);

    const payload = checkEmail[0].passwordhash;
    //console.log("payload:", payload);
    const checkIfPasswordMatch = await comparePassword(password, payload);

    //console.log("checkIfPasswordMatch:", checkIfPasswordMatch);

    if (!checkIfPasswordMatch) throw new Error("Invalid Credentials");

    const token = jwt.sign(
      {
        id: uuidv4,
        email: checkEmail.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: token,
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {login}