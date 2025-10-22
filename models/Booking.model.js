const { Schema, model } = require("mongoose");

const bookingSchema = new Schema(
  {
    accommodation: {
      type: Schema.Types.ObjectId,
      ref: "Accommodation",
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const Booking = model("Booking", bookingSchema);
module.exports = Booking;
