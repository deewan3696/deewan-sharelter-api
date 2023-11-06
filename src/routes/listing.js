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


router.post(
  "/create-listing",
  authorization,
  validationMiddleware(validateListing),
  startListing
);



router.post(
  "/complete-listing",
  authorization,
  validationMiddleware(completeListingValidation),
  completeListing
);




module.exports = router;
