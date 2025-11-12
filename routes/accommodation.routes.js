const router = require("express").Router();
const Accommodation = require("../models/Accommodation.model");
const User = require ("../models/User.model")
const Booking = require("../models/Booking.model")
const Review = require("../models/Review.model")
const verifyToken = require("../middlewares/auth.middlewares")


router.get("/popular", async (req, res, next) => {
  try {
    const popularAccommodations = await Booking.aggregate([
      { $unwind: "$accommodation" },
      { $group: { _id: "$accommodation", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
      {
        $lookup: {
          from: "accommodations",
          localField: "_id",
          foreignField: "_id",
          as: "accommodationData"
        }
      },
      { $unwind: "$accommodationData" },
      { $replaceRoot: { newRoot: "$accommodationData" } }
    ]);

    res.json(popularAccommodations);
  } catch (err) {
    next(err);
  }
});


router.get("/byRating", async (req, res, next) => {
  try {
    const accommodations = await Accommodation.aggregate([
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "accommodation",
          as: "reviews"
        }
      },
      {
        $addFields: {
          avgRating: { $avg: "$reviews.stars" }
        }
      },
      {
        $sort: { avgRating: -1 }
      }
    ]);

    res.json(accommodations);
  } catch (error) {
    next(error);
  }
});

router.get("/favorites", verifyToken, async (req, res, next) => {
  try {

    const user = await User.findById(req.payload._id).select("favorites");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const favoritesIds = user.favorites || [];
    if (!favoritesIds.length) return res.json([]);

    const favorites = await Accommodation.find({ _id: { $in: favoritesIds } });
    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener favoritos", error });
  }
});

router.post("/favorites/:accommodationId", verifyToken, async (req, res, next) => {
  try {
    const userId = req.payload._id;
    const accommodationId = req.params.accommodationId;

    if (!userId) {
      return res.status(401).json({ message: "Debes iniciar sesión" });
    }
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: "Alojamiento no encontrado" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.favorites.includes(accommodationId)) {
      return res.status(400).json({ message: "Este alojamiento ya está en tus favoritos" });
    }
    user.favorites.push(accommodationId);
    await user.save();

    res.status(200).json({ message: "Alojamiento añadido a favoritos", favorites: user.favorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al añadir favorito", error });
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { city, q } = req.query;

    if (city) {
      const cityTrimmed = String(city).trim();
      const regex = new RegExp(`^${cityTrimmed}$`, "i");
      const accommodations = await Accommodation.find({ city: regex }).limit(200);
      return res.json(accommodations);
    }
    if (q) {
      const qTrimmed = String(q).trim();
      const regex = new RegExp(qTrimmed, "i");
      const accommodations = await Accommodation.find({
        $or: [{ title: regex }, { city: regex }, { description: regex }],
      }).limit(200);
      return res.json(accommodations);
    }
    const all = await Accommodation.find().limit(200);
    res.json(all);
  } catch (err) {
    next(err);
  }
});

router.delete("/favorites/:accommodationId", verifyToken, async (req, res, next) => {
  try {
    const userId = req.payload._id;
    const accommodationId = req.params.accommodationId;

    if (!userId) {
      return res.status(401).json({ message: "Debes iniciar sesión" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!user.favorites.includes(accommodationId)) {
      return res.status(400).json({ message: "Este alojamiento no está en tus favoritos" });
    }

    user.favorites = user.favorites.filter(
      (favId) => favId.toString() !== accommodationId
    );

    await user.save();

    res.status(200).json({ message: "Alojamiento eliminado de favoritos", favorites: user.favorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar favorito", error });
  }
});

router.get("/randomCity", async (req, res, next) => {
  try {
    const cities = await Accommodation.distinct('city', { city: { $ne: null } });
    if (!cities.length) return res.status(404).json({ message: "No hay alojamientos con ciudad" });

    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const accommodations = await Accommodation.find({ city: randomCity });

    res.json({ city: randomCity, accommodations });
  } catch (error) {
    next(error);
  }
});

router.get("/own", verifyToken, async (req, res, next) => {
  try {
    const userId = req.payload._id
    const response = await Accommodation.find({ owner: userId })
    res.json(response)
  } catch (error) {
    next(error)
  }
});

router.get("/with-reviews", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: "Se requiere ciudad" });

    const accommodations = await Accommodation.find({ city });
    const results = await Promise.all(
      accommodations.map(async (acc) => {
        const reviews = await Review.find({ accommodation: acc._id });
        const avgStars =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length
            : null;
        return { ...acc.toObject(), avgStars };
      })
    );

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener alojamientos con reviews" });
  }
});

router.get("/:accommodationId", async(req, res,next) => {
 
  try {
    console.log(req.params)
    const response = await Accommodation.findById(req.params.accommodationId)
    .populate("owner")
    res.json(response)
  } catch (error) {
    next(error)
  }
})

router.post("/", verifyToken, async (req, res, next) => {
  try {
    const ownerId = req.payload._id
    const response = await Accommodation.create({
      title: req.body.title,
      maxpeople: req.body.maxpeople,
      type: req.body.type,
      beds: req.body.beds,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      services: req.body.services,
      cost: req.body.cost,
      owner: ownerId,
      photos: req.body.photos,
      description: req.body.description,
      location: req.body.location,
      city: req.body.city
    });
    res.json(response).send("Anuncio creado con exito");
  } catch (error) {
    next(error)
  }
});

router.patch("/:accommodationId", async(req, res, next) =>{
  try {
    const response = await Accommodation.findByIdAndUpdate(req.params.accommodationId, {
      title: req.body.title,
      type: req.body.type,
      beds: req.body.beds,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      livingroom: req.body.livingroom,
      services: req.body.services,
      cost: req.body.cost,
      photos: req.body.photos,
      description: req.body.description,
      location: req.body.location,
      city: req.body.city
    })
    res.json(response).send("Anuncio actualizado")
  } catch (error) {
    next(error)
  }
})

router.delete("/:accommodationId", async (req, res,next) => {
  try {
    await Accommodation.findByIdAndDelete(req.params.accommodationId)
    res.send("Anuncio borrado")
  } catch (error) {
    next(error)
  }
})

module.exports = router;
