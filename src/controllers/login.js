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

  CustomerExist,
  InvalidCredentials,
  LoginSuccessful,
} = require("../constants/messages");
const logger = require("../config/logger");



const login = async (req, res, next) => {
  const { email, password } = req.body;


  try {
    if (!email || !password) {
     
       const err = new Error(InvalidCredentials);
       err.status = 400;
       return next(err);
    }
    //check if the user already exists
    const checkEmail = await findQuery("Users", { email: email });

    if (checkEmail == null) {
     
        const err = new Error(InvalidCredentials);
        err.status = 400;
        return next(err);
    }

    const payload = checkEmail[0].passwordHash;
    //console.log("payload:", payload);
    const checkIfPasswordMatch = await comparePassword(password, payload);

    //console.log("checkIfPasswordMatch:", checkIfPasswordMatch);

    if (!checkIfPasswordMatch) {
       const err = new Error(InvalidCredentials);
       err.status = 400;
       return next(err);
    }

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
      message: LoginSuccessful,
      data: token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = login;
