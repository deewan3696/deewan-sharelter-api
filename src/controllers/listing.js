const { findQuery, insertOne, updateOne, deleteOne } = require("../repository");

const { completePayment, startPayment } = require("../services/payment");
const { redisClient } = require("../config/redis");
const { v4: uuidv4 } = require("uuid");
const { log } = require("handlebars");
const { CreatedListings,
  DeleteListings,
  UpdateListings,
  GetListingMessage,
  InvalidCredentials,
  CompleteListing,
  UnableToCompleteThisTransactionPleaseContactCustomerSupport,
  InvalidTransactionReference,
  ListingNotFound,} = require("../constants/messages")

const startListing = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const {
      location,
      number_of_listings,
      photo_url,
      listing_types,
      price,
      occupancy_limit,
    } = req.body;

    const createListing = {
      listing_id: uuidv4(),
      user_id,
      location,
      number_of_listings,
      photo_url,
      listing_types,
      price,
      occupancy_limit,
    };

    await insertOne("Listing", createListing);
    res.status(201).json({
      status: true,
      message: CreatedListings,
    });
  } catch (error) {
    return next(error);
  }
};

const completeListing = async (req, res) => {
  const { user_id } = req.params;
  try {
    const { reference, amount } = req.body;
    
      if (!reference || !amount) {
          const err = new Error(InvalidCredentials);
          err.status = 400;
          return next(err);
      }
        

    const checkIfReferenceExist = await findQuery("Transaction", {
      payment_reference: reference,
    });
      if (checkIfReferenceExist.length > 0) {
          const err = new Error(InvalidTransactionReference);
          err.status = 400;
          return next(err);
    } 

    const completeTransaction = await completePayment(reference);
      if (completeTransaction.data.data.status != "success") {
          const err = new Error(UnableToCompleteThisTransactionPleaseContactCustomerSupport);
          err.status = 400;
          return next(err);
    }
      

    const createTransaction = {
      transaction_id: uuidv4(),
      user_id,
      listing_id,
      amount,
      payment_reference: reference,
      transaction_status: "COMPLETED",
    };

    await insertOne("Transaction", createTransaction);

    await updateOne("Listing", { listing_id }, { isPaid: true });
    res.status(201).json({
      status: true,
      message: CompleteListing,
    });
  } catch (error) {
  next(error);
  }
};

const deleteListing = async (req, res) => {
  
  const { listing_id } = req.params;
  try {
      if (!listing_id) {
        const err = new Error(ListingNotFound);
        err.status = 400;
        return next(err);
    } 

    await deleteOne("Listing", { listing_id }, { listing_deleted: true });
    res.status(200).json({
      status: true,
      message: DeleteListings,
    });
  } catch (error) {
     next(error);
  }
};

const updateListing = async (req, res) => {
  const { user_id, listing_id } = req.params;
  try {
      if (!user_id || !listing_id) {
         const err = new Error(InvalidCredentials);
         err.status = 400;
         return next(err);
    } 

    await updateOne("Listing", { listing_id }, req.body);
    res.status(200).json({
      status: true,
      message: UpdateListings,
    });
  } catch (error) {
    next(error);
  }
};

const getListing = async (req, res) => {
    const { listing_id } = req.params;
  try {
    const data = await findOne("Listing", { listing_id });
      if (!data) {
         const err = new Error(listingNotFound);
         err.status = 400;
         return next(err);
    } 
    res.status(200).json({
      status: true,
      message: GetListingMessage,
      data,
    });
  } catch (error) {
   next(error);
  }

};
  //to be completed asap
const getAllListings = async (req, res) => {};

module.exports = {
  startListing,
  completeListing,
  deleteListing,
  updateListing,
  getListing,
  getAllListings,
};
