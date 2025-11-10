const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Este campo es obligatorio"],
    },
    text: {
      type: String,
      required: [true, "Este campo es obligatorio"],
      minlength: 15,
    },
    stars: {
      type: Number,
      required: [true, "Este campo es obligatorio"],
      enum: [1, 2, 3, 4, 5],
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    accommodation: {
      type: Schema.Types.ObjectId,
      ref: "Accommodation",
    },
  },
  {
    timestamps: true,
  }
);

const Review = model("Review", reviewSchema);
module.exports = Review;