const router = require("express").Router();
const Booking = require("../models/Booking.model")
const Accommodation = require ("../models/Accommodation.model")
const verifyToken = require("../middlewares/auth.middlewares")


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
})

router.post("/new", async (req, res, next) => {
  try {
    const { accommodationId, userId, start, end, guests, cost } = req.body;

    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }
    const newBooking = await Booking.create({
      accommodation: accommodationId,
      user: userId,
      start,
      end,
      guests,
      cost,
      status: "pending"
    });
    res.status(201).json(newBooking);
  } catch (err) {
    next(err);
  }
});

router.get("/tripsPending", verifyToken, async (req, res, next) => {
  try {
    const userId = req.payload?._id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Debes iniciar sesión" });
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "accommodation",
        select: "title photos cost owner",
        populate: { path: "owner", select: "username photo" },
      })
      .sort({ createdAt: -1 });

    const count = bookings.length;

    const accommodationsRaw = bookings.map((b) => b.accommodation).filter(Boolean);
    const accommodationsById = new Map();
    for (const a of accommodationsRaw) {
      accommodationsById.set(String(a._id), a);
    }
    const uniqueAccommodations = Array.from(accommodationsById.values());

    res.json({
      count,
      accommodations: uniqueAccommodations,
      bookings,
    });
  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).json({ message: "Error al obtener reservas" });
  }
});

router.get("/lastTrips", verifyToken, async (req, res, next) => {
  try {
    const userId = req.payload?._id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Debes iniciar sesión" });

    // Trae solo las reservas cuyo end (fecha de salida) sea anterior a ahora
    const bookings = await Booking.find({ user: userId, end: { $lt: new Date() } })
      .populate({
        path: "accommodation",
        select: "title photos cost owner",
        populate: { path: "owner", select: "username photo" },
      })
      // Ordena por fecha de salida más reciente primero (los viajes más recientes en el pasado)
      .sort({ end: -1 });

    const count = bookings.length;

    const accommodationsRaw = bookings.map((b) => b.accommodation).filter(Boolean);
    const accommodationsById = new Map();
    for (const a of accommodationsRaw) {
      accommodationsById.set(String(a._id), a);
    }
    const uniqueAccommodations = Array.from(accommodationsById.values());

    res.json({
      count,
      accommodations: uniqueAccommodations,
      bookings,
    });
  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).json({ message: "Error al obtener reservas" });
  }
});

router.get("/:bookingId", async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    console.log(bookingId)

    const booking = await Booking.findById(bookingId).populate("accommodation");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ booking });
  } catch (err) {
    console.error("Error GET /api/booking/:bookingId", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// router.patch("/:bookingId", async(req,res,next) => {
//   try{
//     const { bookingId } = req.params
//     const response = await Booking.findByIdAndUpdate(bookingId)

//   }
// })

module.exports = router;