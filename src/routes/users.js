const express = require("express");
const router = express.Router();
const validationData = require("../validations/users");
const validationMiddleware = require("../middleware/validation");
const authorization = require("../middleware/authorization");
const {
  createUser,
  verifyEmailOtp,
  resendOtpToEmail,
  startForgetPassword,
  completeForgotPassword,
} = require("../controllers/users");

//USERS ROUTES
/**
 * create a new user record
 * @swagger
 * /user/create:
 *   post:
 *     summary: creates a new user
 *     description: This Creates a new record for the user
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: lastname
 *         in: body
 *         required: true
 *       - name: othernames
 *         in: body
 *         required: true
 *       - name: email
 *         in: body
 *         required: true
 *       - name: phone_number
 *         in: body
 *         required: true
 *       - name: password
 *         in: body
 *         required: true
 *       - name: referrer_code
 *         in: body
 *         required: false
 *     responses:
 *        201:
 *          description: Account created.
 *        422:
 *          Bad Request
 */
router.post("/user/create", validationMiddleware(validationData.validateRegistration),createUser);



/**
 * verify otp sent to customer email
 * @swagger
 * /verify-email-otp/otp/email:
 *   get:
 *     summary: verification of  otp sent to user email 
 *     description: This verifies token sent to customer email
 *     tags:
 *       - Users
 *     produces:	 
 *       - application/json	 
 *     parameters:	 
 *       - name: email	 
 *         in: path	 
 *         required: true
 *       - name:  otp	 
 *         in: path	 
 *         required: true
 *     responses:
 *        200:
 *          description: You have successfully verified your email address..
 *        422:
 *          Bad Request
*/
router.get("/verify-email-otp/:_otp/:email", verifyEmailOtp);

/**
 * resend otp to customer email
 * @swagger
 * /resend-email-otp/email:
 *   post:
 *     summary: resend otp to customer phone
 *     description: This resend otp to customer phone
 *     tags:
 *       - Users
 *     produces:	 
 *       - application/json	 
 *     parameters:	 
 *       - name: otp	 
 *         in: path	 
 *         required: true
 *     responses:
 *        200:
 *          description: otp resent successfully to your email
 *        422:
 *          Bad Request
*/
router.post("/resend-email-otp/:email", resendOtpToEmail);

/**
 * start forget password
 * @swagger
 * /user/start-forget-password/{email}:
 *   get:
 *     summary: start forget password
 *     description: This starts forget password for the customer via their email
 *     tags:
 *       - Users
 *     produces:	 
 *       - application/json	 
 *     parameters:	 
 *       - name: email	 
 *         in: path	 
 *         required: true
 *     responses:
 *        200:
 *          description: A verification link has been sent to email
 *        422:
 *          Bad Request
*/
router.get("/start-forget-password/email", validationMiddleware(validationData.validateEmail), startForgetPassword);

/**
 * Complete forget password 
 * @swagger
 * /user/forget-password/complete/{otp}:
 *   patch:
 *     summary: Complete forget password
 *     description: This verify the hash sent to customer on starting the forget password
 *     tags:
 *       - Users
 *     produces:	 
 *       - application/json	 
 *     parameters:	 
 *       - name: email	 
 *         in: path	 
 *         required: true
 *       - name: otp	 
 *         in: path	 
 *         required: true
 *       - name: new_password	 
 *         in: body	 
 *         required: true
 *     responses:
 *        200:
 *          description: You can go ahead to set a new password.
 *        422:
 *          Bad Request
 *        404: 
 *         description: The link has expired or is invalid
 *        500:
 *         description: Internal Server Error
 *        401:
 *        description: Unauthorized
 * 
*/
router.patch("/complete-forget-password/:otp", validationMiddleware(validationData.completeForgotPassword), completeForgotPassword);

//LISTINGS ROUTES

//TRANSACTIONS ROUTES

//later, trying to custom error handling as a middleware
// router.use(responseHandler)
// router.use(errorHandler)

module.exports = router;
