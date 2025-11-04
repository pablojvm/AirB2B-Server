const router = require("express").Router();
const Accommodation = require("../models/Accommodation.model");
const User = require ("../models/User.model")
const Booking = require("../models/Booking.model")
const verifyToken = require("../middlewares/auth.middlewares")


router.get("/popular", async (req, res, next) => {
  try {
    const popularAccommodations = await Booking.aggregate([
      { $unwind: "$accommodation" },
      { $group: { _id: "$accommodation", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
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
    if (!req.user?._id) return res.status(401).json({ message: "Debes iniciar sesión" });

    const user = await User.findById(req.user._id).select("favorites");
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
    const userId = req.user?._id;
    const accommodationId = req.params.accommodationId;

    // 1️⃣ Comprobar si el usuario está autenticado
    if (!userId) {
      return res.status(401).json({ message: "Debes iniciar sesión" });
    }

    // 2️⃣ Verificar que el alojamiento existe
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: "Alojamiento no encontrado" });
    }

    // 3️⃣ Buscar al usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 4️⃣ Evitar duplicados
    if (user.favorites.includes(accommodationId)) {
      return res.status(400).json({ message: "Este alojamiento ya está en tus favoritos" });
    }

    // 5️⃣ Añadir el alojamiento a favoritos y guardar
    user.favorites.push(accommodationId);
    await user.save();

    res.status(200).json({ message: "Alojamiento añadido a favoritos", favorites: user.favorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al añadir favorito", error });
  }
});

router.delete("/favorites/:accommodationId", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const accommodationId = req.params.accommodationId;

    // 1️⃣ Comprobar autenticación
    if (!userId) {
      return res.status(401).json({ message: "Debes iniciar sesión" });
    }

    // 2️⃣ Buscar al usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 3️⃣ Comprobar si el alojamiento está en favoritos
    if (!user.favorites.includes(accommodationId)) {
      return res.status(400).json({ message: "Este alojamiento no está en tus favoritos" });
    }

    // 4️⃣ Eliminar el alojamiento del array de favoritos
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
