const express = require("express");
const router = express.Router();
const validationData = require("../validations/users");
const validationMiddleware = require("../middleware/validation");
const authorization = require("../middleware/authorization");
const {login} = require ("../controllers/login")








/**
 * Logs a customer into the app
 * @swagger
 * /login:
 *   post:
 *     summary: logs the customer into the app
 *     description: This logs the customer into the application and returns a token
 *     tags:
 *       - Auth
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         in: body
 *         required: true
 *       - name: password
 *         in: body
 *         required: true
 *     responses:
 *        200:
 *          description: Successfully Login.
 *        422:
 *          Bad Request
 */

router.post("/login", validationMiddleware(validationData.login), login);
