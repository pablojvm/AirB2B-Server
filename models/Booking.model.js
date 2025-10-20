const { Schema, model } = require("mongoose");

const bookingSchema = new Schema(
  {
    accommodation: [
    {
      type: Schema.Types.ObjectId,
      ref: "Accommodation"
    }
  ],
    user: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  ],
    start: Date,
    end: Date,
    status: {
        type: String,
        enum: ["confirmed", "pending", "cancelled"]
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Booking = model("Booking", bookingSchema);
module.exports = Booking;