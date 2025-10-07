const jwt = require("jsonwebtoken");

const EXPIRES = "10m";

exports.signCheckout = (payload) =>
  jwt.sign(payload, process.env.CHECKOUT_SIGNING_KEY, { expiresIn: EXPIRES });

exports.verifyCheckout = (token) =>
  jwt.verify(token, process.env.CHECKOUT_SIGNING_KEY);
