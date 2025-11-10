const { Schema, model } = require("mongoose");

const accommodationSchema = new Schema(
  {
    title: String,
    maxPeople: Number,
    type: {
      type: String,
      enum: [
        "Apartment",
        "House",
        "Cabin",
        "Bungalow",
        "Guesthouse",
        "Hotel",
        "Bed and Breakfast",
        "Farm stay",
        "Boat",
        "Treehouse",
        "Castle",
        "Camper/RV",
      ],
    },
    beds: Number,
    bedrooms: Number,
    bathrooms: Number,
    livingroom: Number,
    services: {
      type: [String],
      enum: [
        "Wi-Fi",
        "Air conditioning",
        "Heating",
        "TV",
        "Washer",
        "Dryer",
        "Kitchen",
        "Private bathroom",
        "Hair dryer",
        "Shampoo",
        "Towels",
        "Iron",
        "Parking",
        "Pool",
        "Gym",
        "Hot tub",
        "Balcony",
        "Garden",
        "BBQ grill",
        "Fireplace",
        "Pet friendly",
        "Smoke detector",
        "First aid kit",
        "Workspace",
        "Breakfast included",
        "24h check-in",
      ],
    },
    cost: {
      type: Number,
      required: [true, "Este campo es obligatorio"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    photos: {
      type: [String],
      default:
        "https://res.cloudinary.com/dinaognbb/image/upload/v1761645190/imagenpre_uq6mvm.webp",
    },
    description: String,
    location: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },
    city: String,
  },
  {
    timestamps: true,
  }
);

const Accommodation = model("Accommodation", accommodationSchema);
module.exports = Accommodation;