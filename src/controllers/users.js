require("dotenv").config();
const { findQuery, insertOne, find, deleteOne,updateOne } = require("../repository");
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

const createUser = async (req, res, next) => {
  const { lastname, othernames, email, phone_number, password, referrer_code } =
    req.body;

  try {
    const user = await findQuery("Users", { email: email });

    if (user.length > 0) {
      logger.error({
        message: `Customer credentials existed. details supplied is ${JSON.stringify(
          req.body
        )}`,
        status: 422,
        method: req.method,
        ip: req.ip,
        url: req.originalUrl,
      });

      const err = new Error(CustomerExist);
      err.status = 400;
      return next(err);
    }
    const user_id = uuidv4();
    const passwordhash = await hashMyPassword(password);
    const referCode = generateReferralCode();
    const createUser = {
      user_id,
      lastname,
      othernames,
      email,
      phone_number,
      referrer_code: referCode,
      passwordhash: passwordhash[1],
      passwordSalt: passwordhash[0],
    };

    await insertOne("Users", createUser);

    const _otp = generateOTP();

    // const otpModel = {
    //   email: createUser.email,
    //   otp: _otp,
    // };
    redisClient.set(`${createUser.email}`, JSON.stringify(_otp), {
      EX: 60 * 3, //seconds
      //NX: true,
    });
    //await insertOne("otps", otpModel);

    readFileAndSendEmail(email,"OTP",` Hello  ${lastname} ${othernames},\n Your OTP is ${_otp}`);

    // Verify the OTP
  

    res.status(201).json({
      status: true,
      message: CustomerCreated,
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

//to work on it 
  const verifyEmailOtp = async (req, res, next) => {
    const { email, otp } = req.params;
    try {
      const data = await redisClient.get(`${email}`);
      console.log("data: " ,data);

      if (!data) {
        logger.error({
          message: `email is not valid ${email}`,
          status: 422,
          method: req.method,
          ip: req.ip,
          url: req.originalUrl,
        });

        const err = new Error(InvalidCredentials);
        err.status = 400;
        return next(err);
      }

      if (otp !== data) {
        logger.error({
          message: `otp is not valid ${otp}`,
          status: 422,
          method: req.method,
          ip: req.ip,
          url: req.originalUrl,
        });

        const err = new Error(OtpMismatch);
        err.status = 400;
        return next(err);
      }

      await updateOne(
        "Users",
        { email },
        { is_verified: true }
      );
      res.status(200).json({
        status: 200,
        message: EmailVerificationSuccessful,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const checkEmail = await findQuery("Users", { email: email });

    //console.log("checkEmail:", checkEmail);

    if (isEmpty(checkEmail)) throw new Error("Invalid Credentials");

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

const resendOtpToEmail = async (req, res, next) => {
      const { email } = req.body;
      try {
        if (!email) throw new Error(InvalidCredentials);
        if (!email) {
          logger.error({
            message: `email is not valid ${email}`,
            status: 422,
            method: req.method,
            ip: req.ip,
            url: req.originalUrl,
          });

          const err = new Error(InvalidCredentials);
          err.status = 400;
          return next(err);
        }
        const _otp = generateOTP();
        console.log("_otp : ", _otp);
        redisClient.set(`${email}`, JSON.stringify(_otp), {
          EX: 60 * 5, //seconds
          NX: true,
        });

    //readFileAndSendEmail(email, "OTP", ` Hello  ${lastname} ${othernames},\n Your New OTP is ${_otp}`);

        res.status(200).json({
          status: 200,
          message: OtpResentSuccessfully,
        });
      } catch (error) {
        next(error);
      }
 };

module.exports = {
  createUser,
  login,
  verifyEmailOtp,
  resendOtpToEmail,
};
