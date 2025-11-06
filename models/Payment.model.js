const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  amount: Number, 
  paymentIntentId: String, 
  clientSecret: String, 
  status: {
    type: String,
    enum: ["incomplete", "succeeded"],
    default: "incomplete",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking"
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
