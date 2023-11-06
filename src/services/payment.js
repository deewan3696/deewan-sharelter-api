require("dotenv").config();
const axios = require("axios");

const startPayment = async (email, amount) => {
  const amountInKobo = amount * 100;
  return axios({
    method: "POST",
    url: `${process.env.PAYSTACK_BASEURL}/transaction/initialize`,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    data: {
      email,
      amount: amountInKobo,
    },
    channels: ["card", "bank", "ussd", "bank_transfer"],
  });
};

const completePayment = async (reference) => {
  return axios({
    method: "GET",
    url: `${process.env.PAYSTACK_BASEURL}/transaction/verify/${reference}`,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });
};
module.exports = {
  startPayment,
  completePayment,
};
