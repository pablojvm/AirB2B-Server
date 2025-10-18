const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required.']
    },
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,
      trim: true
    },
    photo: {
      type: String,
      default: "https://res.cloudinary.com/dinaognbb/image/upload/v1749822599/fotouser_f9vrur.png",
    },
    favorites: [
    {
      type: Schema.Types.ObjectId,
      ref: "Ad"
    }
  ]
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;
