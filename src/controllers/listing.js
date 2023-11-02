require("dotenv").config()
const { findquery, insertOne, findOne, updateOne} = require("../repository/index")
const { v4: uuidv4 } = require("uuid");
const { redisClient } = require("../config/redis");
const {
  createdListings,
  deleteListings,
  updateListings,
  getListingMessage,
  listingNotFound,
} = require("../constants/messages");



const createListing = async (req, res, next) => {
  const {user_id}  = req.params;
  
    const {
      number_of_listing,
      location,
      photo_url,
      price,
      listing_types,
      occupancy_limit,
    } = req.body;

  try {
    const newListing = {
      listing_id: uuidv4(),
      user_id: user_id,
      number_of_listing,
      location,
      photo_url,
      price,
      listing_types,
      occupancy_limit,
    };
    redisClient.set(newListing.listing_id, photo_url, { EX: 60 * 10 });
    
    await insertOne("Listing", newListing);
    res.status(201).json({
      status: true,
      message: createdListings,
      data:[]
    });
  

  } catch (error) {
    next(error);
  }
};
const updateListing = async (req, res, next) => {
  const { listing_id } = req.params;
  try {
    const data = await findOne("Listing", { listing_id });
    if (!data) throw new Error(listingNotFound);

    await updateOne("Listing", { listing_id }, req.body);
    res.status(200).json({
      status: true,
      message: updateListings,
    });
  } catch (error) {
    next(error);
  }
};
//we finish getAlllistings  on wednesday by God grace
const getAllListings = async (req, res) => {
  

};

const getListing = async (req, res, next) => {
  const { listing_id } = req.params;
  try {
    const data = await findOne("Listing", { listing_id });
    if (!data) throw new Error(listingNotFound);
    res.status(200).json({
      status: true,
      message: getListingMessage,
      data
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};
const deleteListing = async (req, res, next) => {
  const { listing_id } = req.params;
  try {
    await updateOne("Listing", { listing_id }, { listing_deleted: true });
    res.status(200).json({
      status: true,
      message: deleteListings,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};
module.exports = {
  createListing,
  updateListing,
  getListing,
  deleteListing,
  getAllListings,
};