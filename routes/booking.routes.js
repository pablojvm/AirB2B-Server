const router = require("express").Router();
const Booking = require("../models/Booking.model")
const Accommodation = require ("../models/Accommodation.model")
const verifyToken = require("../middlewares/auth.middlewares")

router.post("/", async (req, res, next) => {
  try {
    const { accommodationId, userId, start, end } = req.body;

    // Validar que el alojamiento existe
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    // Crear el booking
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

module.exports = router