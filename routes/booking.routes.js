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

router.get("/trips", verifyToken, async (req, res, next) => {
  try {
    const userId = req.payload?._id || req.user?._id
    if (!userId) return res.status(401).json({ message: "Debes iniciar sesión" })
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "accommodation",
        select: "title photos cost owner",
        populate: { path: "owner", select: "username photo" }
      })
      .sort({ createdAt: -1 })

    const count = bookings.length
    const accommodationsRaw = bookings.map((b) => b.accommodation).filter(Boolean)
    const accommodationsById = new Map();
    for (const a of accommodationsRaw) {
      accommodationsById.set(String(a._id), a);
    }
    const uniqueAccommodations = Array.from(accommodationsById.values())
    res.json({
      count,
      accommodations: uniqueAccommodations,
      bookings
    })
  } catch (err) {
    console.error("Error fetching trips:", err)
    res.status(500).json({ message: "Error al obtener reservas" })
  }
});


module.exports = router