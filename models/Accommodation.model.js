const { Schema, model } = require("mongoose");

const accommodationSchema = new Schema(
  {
    title: String,
    type: {
        type: String,
        enum:[]
    },
    beds: Number,
    bedrooms: Number,
    bathrooms: Number,
    livingroom: Number,
    services: {
        type: String,
        enum: []
    },
    cost: {
      type: Number,
      required: [true, "Este campo es obligatorio"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    photos: [String],
    description: String,
    location: {
    type: { type: String, default: "Point" },
    coordinates: [Number], // [longitud, latitud]
  },
  city: String
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Accommodation = model("Accommodation", accommodationSchema);
module.exports = Accommodation;
