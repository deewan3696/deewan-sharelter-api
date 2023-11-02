const Joi = require("joi");

const validateListing = Joi.object({
  number_of_listing: Joi.string().required(),
  location: Joi.string().required(),
  photo_url: Joi.string().required(),
  price: Joi.string().required(),
  listing_types: Joi.string().required(),
  occupancy_limit: Joi.string().required(),
});




module.exports =  validateListing;