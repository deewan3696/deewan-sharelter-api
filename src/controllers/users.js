require("dotenv").config();
const {
  findQuery,
  insertOne,
  find,
  deleteOne,
  updateOne,
  updateMany,
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
//const jwt = require("jsonwebtoken");
const {
  CustomerCreated,
  resetCustomerPasswordSuccessful,
  CustomerExist,
  InvalidCredentials,
  OtpExpired,
  invalidPhone,
  CustomerNotFound,
  EmailHasNotBeenVerified,
  OtpMismatch,
  OtpResentSuccessfully,
  EmailVerificationSuccessful,
  CustomerUpdatedSuccessfully,
  LoginSuccessful,
  CustomerDetailsFetched,
} = require("../constants/messages");
const logger = require("../config/logger");
const {
  validateEmail,
  completeForgotPassword,
  validateChangePassword,
} = require("../validations/users");

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
//to -do
const verifyEmailOtp = async (req, res, next) => {
  const { email, otp } = req.params;
  try {
    if (!otp || !email) { 
      const err = new Error(OtpMismatch);
      err.status = 400;
      return next(err);
    }
   
    const otpFromRedis = await redisClient.get(`otp_${email}`);
      console.log("otpFromRedis", otpFromRedis);
    if (isEmpty(otpFromRedis)) {
      const err = new Error(OtpExpired);
      err.status = 400;
      return next(err);
    } 
    if (otp != otpFromRedis) {
      const err = new Error(OtpExpired);
      err.status = 400;
      return next(err);
    }
    await updateOne("Users", { is_email_verified: true }, { email: email });

    redisClient.del(`otp_${email}`)
        res.status(200).json({
          status: true,
          message: EmailVerificationSuccessful,
        });
 
    
  } catch (error) {
    next(error);
  }
};

const resendOtpToEmail = async (req, res, next) => {

  const { email } = req.params;
  const newOtp = generateOTP();
  
  try {
    const otpFromRedis = await redisClient.get(`otp_${email}`);
    if (!isEmpty(otpFromRedis)) {
    //readFileAndSendEmail(email,"RESEND OTP",`\n Your OTP is ${otpFromRedis}`);
    }
    else {
      redisClient.set(`otp_${email}`, newOtp, { EX: 60 * 4 })
      
      //  readFileAndSendEmail(
      //    email,
      //    "RESEND OTP",
      //    ` Hello  ${lastname} ${othernames},\n Your OTP is ${otpFromRedis}`
      //  );
    }
      
     res.status(200).json({
       status: true,
       message: OtpResentSuccessfully,
       data: [],
     });
    
  } catch (err) {
    next(err);
  }
};

const startForgetPassword = async (req, res,next) => {
  const { email } = req.params;
  const { error } = validateEmail(req.params);
  try {
    if (error !== undefined) {
      const err = new Error(InvalidCredentials);
      err.status = 400;
      return next(err);
    }
    const _otp = generateOTP();

    const user = await findQuery("Users", { email: email });

    if (!user) {
      const err = new Error(InvalidCredentials);
      err.status = 400;
      return next(err);
    }

    redisClient.set(email, _otp, { EX: 60 * 10 });
    // readFileAndSendEmail(
    //   email,"OTP",` Hello  ${lastname} ${othernames},\n Your OTP for forget password is ${_otp}`
    // );
    res.status(200).json({
      status: true,
      otp: _otp,
      message: resetPasswordOtpSentSuccessfully,
    });
  } catch (error) {
    next(error);
  }
};

const completeForgetPassword = async (req, res,next) => {
  const { email, otp } = req.params;
  const { newPassword } = req.body;
  const { error } = completeForgotPassword(req.body);
  try {
    if (error !== undefined) {
      const err = new Error(InvalidCredentials);
      err.status = 400;
      return next(err);
    }
    const checkOtp = await redisClient.get(email, otp);

    if (!checkOtp) {
      const err = new Error(OtpMismatch);
      err.status = 400;
      return next(err);
    }

    const { hash, salt } = await hashMyPassword(newPassword);
    await updateMany("Users", {
      passwordhash: hash,
      passwordSalt: salt,
    });

    res.status(200).json({
      status: true,
      message: resetCustomerPasswordSuccessful,
    });
  } catch (error) {
    next(error);
  }
};


const profile = async (req, res,next) => {
  const { user_id } = req.params;
  try {
    const user = await find("Users", { user_id: user_id });
   
    if (!user) {
      const err = new Error(CustomerNotFound);
      err.status = 400;
      return next(err);
    } 

     res.status(200).json({
       status: true,
       message: CustomerDetailsFetched,
       data: user,
     });
  } catch (error) {
   next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const { user_id} = req.params;
  

  try {
    
    
    await updateOne("Users", { user_id: user_id });
   
    res.status(200).json({
      status: true,
      message: CustomerUpdatedSuccessfully,
    });
  } catch (error) {
     next(error);
  }
};

  //email must be verify before password can be change
const changePassword = async (req, res, next) => { 
     
       const { email, passwordhash } = req.params;
       const { newPassword } = req.body;
       const { error } = validateChangePassword(req.body);
       try {
         if (error !== undefined) {
            const err = new Error(InvalidCredentials);
            err.status = 400;
            return next(err);
         } 

         const checkPasssword = await comparePassword(
           newPassword,
           passwordhash
         );
         if (checkPasssword) throw new Error(passwordMisamtch);

         const { hash, salt } = await hashMyPassword(newPassword);
         await updateMany("Users", {
           passwordhash: hash,
           passwordSalt: salt,
         });
      
         res.status(200).json({
           status: true,
           message: passwordUpdatedSuccesfully,
         });
       } catch (error) {
         next(error);
       }
  };

     












module.exports = {
  createUser,
  verifyEmailOtp,
  resendOtpToEmail,
  startForgetPassword,
  completeForgetPassword,
  profile,
  updateProfile,
  changePassword,
};
