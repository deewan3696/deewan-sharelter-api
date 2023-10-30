const express = require("express");
const router = express.Router();
const validationData = require("../validations/users");
const validationMiddleware = require("../middleware/validation");
const authorization = require("../middleware/authorization");
const {createListing} = require("../controllers/listing");



/**
 * help create lisitng for a customer
 * @swagger
 * /listings:
 *   post:
 *     summary: creates a new listing
 *     description: This Creates a new listing for the user
 *     tags:
 *       - Listing
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: number_of_listing
 *         in: body
 *         required: true
 *       - name: location
 *         in: body
 *         required: true
 *       - name: photo_url
 *         in: body
 *         required: true
 *       - name: price
 *         in: body
 *         required: true
 *       - name: listing_types
 *         in: body
 *         required: true
 *       - name: occupancy_limit
 *         in: body
 *         required: true
 *     responses:
 *        201:
 *          description: Listing created.
 *        422:
 *          Bad Request
 */
router.post("/create-listing",validationMiddleware(validationData.create),createListing);