const { findQuery, insertOne } = require("../repository");
const {
  hashMyPassword,
  generateOTP,
  generateReferralCode,
  comparePassword,
  isEmpty,
} = require("../utils/index");
const redis = require("redis");
const { readFileAndSendEmail } = require("../services/email");
const { redisClient } = require("../config/redis");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const create = async (req, res, next) => {
  const { lastname, othernames, email, phone_number, password, referrer_code } =
    req.body;

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
      referrer_code: referCode,
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

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const checkEmail = await findQuery("Users", { email: email });

    //console.log("checkEmail:", checkEmail);

    if (isEmpty(checkEmail)) throw new Error("Invalid Credentials");

  

    const payload = checkEmail[0].passwordhash;
    //console.log("payload:", payload);
    const checkIfPasswordMatch = await comparePassword(password, payload);
    console.log("checkIfPasswordMatch:", checkIfPasswordMatch);

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

module.exports = {
  create,
  login,
};
