require("dotenv").config();
const { findQuery, insertOne, find, deleteOne,updateMany } = require("../repository");
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
//const jwt = require("jsonwebtoken");
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
    redisClient.set(email, _otp, { EX: 60 * 10 });
    //await insertOne("otps", otpModel);

    // readFileAndSendEmail(email,"OTP",` Hello  ${lastname} ${othernames},\n Your OTP is ${_otp}`);

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


  
const verifyEmailOtp = async (req, res, next) => {
  const { email, otp } = req.params;
  try {
    
    const user = await find("Users", {
      email: email,
    });
    console.log("user", user);
    if (user.length > 0) {
      logger.error({
        message: `Invalid credentials. details supplied is ${JSON.stringify(
          req.body
        )}`,
        status: 422,
        method: req.method,
        url: req.originalUrl,
      });

      const err = new Error(InvalidCredentials);
      err.status = 400;
      return next(err);
    } else {
      
      const otpFromRedis = await redisClient.get(email);
       console.log("otpFromRedis", otpFromRedis);
      if (otpFromRedis === otp) {
        
        await updateMany(
          "Users",
          { email: email },
          { is_email_verified: true }
        );
      //redisClient.del(email);
        res.status(200).json({
          status: true,
          message: "Account verification successful",
        });
      } else {
        
        logger.error({
          message: `Unable to verify email. details supplied is ${JSON.stringify(
            req.params
          )}`,
          status: 500,
          method: req.method,
          url: req.originalUrl,
        });

        const err = new Error(EmailHasNotBeenVerified);
        err.status = 500;
        return next(err);
      }
    }
  } catch (error) {
    next(error);
  }
};


const resendOtpToEmail = async (req, res, next) => {
  const { email } = req.params;
  const newOtp = generateOTP();
  console.log(newOtp);
  try {
    const otpFromRedis = await redisClient.get(email);
    if (otpFromRedis) {
      return res.status(200).json({
        status: true,
        message: "OTP have not expired",
      });
    } else {
      const getOtp = await redisClient.set(email, newOtp, { EX: 60 * 10 });

      if (getOtp != "OK") {
        logger.error({
          message: `Unable to create account. details supplied is ${JSON.stringify(
            req.body
          )}`,
          status: 500,
          method: req.method,
          url: req.originalUrl,
        });

        const err = new Error("Unable to create account");
        err.status = 500;
        return next(err);
      }
      //Send Email

      const dataToBeReplaced = {
        otp: newOtp,
      };

      const sendMail = await readFileAndSendEmail(
        email,
        " Xwapit OTP Resend",
        dataToBeReplaced,
        "otp"
      );

      res.status(200).send({
        status: true,
        message: "otp resent to email",
      });
    }
  } catch (err) {
    next(err);
  }
};

const startForgetPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const checkIfUserExist = await findOne(xwapitDB_collections.users, {
      email: email,
    });

    if (!checkIfUserExist) throw new Error("user not found");

    const _otp = generateOtp(6);
    console.log(_otp);
    res.status(400).json({
      status: true,
      message: "otp has been sent to your email, " || "an error occurred",
      otp: _otp,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: false,
      message: error.message || "an error occurred",
    });
  }
};

const completeForgotPassword = async (req, res, next) => {
  const { newPassword, email,} = req.body;
  const { otp } = req.params;
  try {
    // if(otp!=process.env.OTP) throw new Error ("Invalid otp")
    //we have to verify otp
    const { hash, salt } = await hashPassword(newPassword);
    await updateOne(
      "Users",
      { email },
      {
        passwordHash: hash,
        passwordSalt: salt,
      }
    );
    res.status(400).json({
      status: true,
      message: resetCustomerPasswordSuccessful || "an error occurred",
      // otp: _otp,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: false,
      message: error.message || "an error occurred",
    });
  }
};




module.exports = {
  createUser,
  verifyEmailOtp,
  resendOtpToEmail,
  startForgetPassword,
  completeForgotPassword,
};
