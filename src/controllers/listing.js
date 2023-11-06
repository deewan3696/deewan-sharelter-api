const { findQuery, insertOne, updateOne, deleteOne } = require("../repository");
const {
  validateListing,
  validateCompleteListing,
  validateUpdateListing,
} = require("../validations/listings");
const { completePayment, startPayment } = require("../services/payment");
const { redisClient } = require("../config/redis");
const { v4: uuidv4 } = require("uuid");
const { log } = require("handlebars");

const startListing = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { locations, description, photo_url, listing_type, price } = req.body;

    const createListing = {
      listing_id: uuidv4(),
      user_id,
      locations,
      description,
      price,
      listing_type,
      photo_url,
    };

    await insertOne("Listings", createListing);
    res.status(201).json({
      status: true,
      message: "listing created successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const completeListing = async (req, res) => {
  const { user_id } = req.params;
  try {
    const { reference, listing_id, amount } = req.body;
    const { error } = validateCompleteListing(req.body);
    if (error != undefined) throw new Error(error.details[0].message);

    const checkIfReferenceExist = await findQuery("Transactions", {
      payment_reference: reference,
    });
    if (checkIfReferenceExist.length > 0) throw new Error("invalid reference");

    const completeTransaction = await completePayment(reference);
    if (completeTransaction.data.data.status != "success")
      throw new Error("invalid transaction");

    const createTransaction = {
      transaction_id: uuidv4(),
      user_id,
      listing_id,
      amount,
      payment_reference: reference,
      transaction_status: "COMPLETED",
    };

    await insertOne("Transactions", createTransaction);

    await updateOne("Listings", { listing_id }, { isPaid: true });
    res.status(201).json({
      status: true,
      message: "listing completed successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const deleteListing = async (req, res) => {
  // don't know if it's an admin endpoint or not yet
  const { listing_id } = req.params;
  try {
    if (!listing_id) throw new Error("unauthorize request");

    await deleteOne("Listings", { listing_id });
    res.status(200).json({
      status: true,
      message: "listing deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const updateListing = async (req, res) => {
  const { user, listing_id } = req.params;
  try {
    if (!user || !listing_id) throw new Error("unauthorize request");

    const { error } = validateUpdateListing(req.body);
    if (error != undefined) throw new Error(error.details[0].message);

    await updateOne("Listings", { listing_id }, req.body);
    res.status(200).json({
      status: true,
      message: "listing updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const getListing = async (req, res) => {};

module.exports = {
  startListing,
  completeListing,
  deleteListing,
  updateListing,
  getListing,
};
