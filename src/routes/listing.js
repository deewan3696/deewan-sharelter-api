const express = require("express");
const router = express.Router();
const {
  validateListing,
  completeListingValidation,
} = require("../validations/listing");
const validationMiddleware = require("../middleware/validation");
const authorization = require("../middleware/authorization");
const {
  startListing,
  completeListing,
  deleteListing,
  updateListing,
  getListing,
  getAllListings,
} = require("../controllers/listing");




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
router.post(
  "/create-listing",
  authorization,
  validationMiddleware(validateListing),
  startListing
);

/**
 * help to make payment for  listing for a customer
 * @swagger
 * /listings:
 *   post:
 *     summary: completely creates a new listing
 *     description: This Creates a new listing for the user
 *     tags:
 *       - Listing
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: payment_reference
 *         in: body
 *         required: true
 *       - name: amount
 *         in: body
 *         required: true
 *       - name: 
 *         in: body
 *         required: 
 *       - name: 
 *         in: body
 *         required: 
 *       - name: 
 *         in: body
 *         required: 
 *       - name: 
 *         in: body
 *         required: 
 *     responses:
 *        201:
 *          description: Listing created with payment confirmation.
 *        422:
 *          Bad Request
 */

router.post(
  "/complete-listing",
  authorization,
  validationMiddleware(completeListingValidation),
  completeListing
);




module.exports = router;
