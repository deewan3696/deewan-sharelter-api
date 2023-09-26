const express = require("express");
const router = express.Router();
const validationData = require("../validations/users");
const validationMiddleware = require("../middleware/validation");
const authorization = require("../middleware/authorization");
const { create } = require("../controllers/users");

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
router.post("/user/create",validationMiddleware(validationData) ,create);

//LISTINGS ROUTES

//TRANSACTIONS ROUTES

//later, trying to custom error handling as a middleware
// router.use(responseHandler)
// router.use(errorHandler)

module.exports = router;
