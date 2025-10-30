const router = require("express").Router();
const Booking = require("../models/Booking.model")
const Accommodation = require ("../models/Accommodation.model")
const verifyToken = require("../middlewares/auth.middlewares")

router.post("/", async (req, res, next) => {
  try {
    const { accommodationId, userId, start, end } = req.body;

    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }
    const newBooking = await Booking.create({
      accommodation: accommodationId,
      user: userId,
      start,
      end,
      status: "pending"
    });
    res.status(201).json(newBooking);
  } catch (err) {
    next(err);
  }
});

router.get("/trips", verifyToken, async(req,res,next) => {
  try{
    const userId = req.payload._id;
    const response = await Booking.countDocuments({ user: userId });
    res.json(response)
  }catch (error) {
    next(error);
  }
})

module.exports = router