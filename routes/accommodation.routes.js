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

    res.json(popularAccommodations); // <-- devuelve un array directamente
  } catch (err) {
    next(err);
  }
});


router.get("/byRating", async (req, res, next) => {
  try {
    const accommodations = await Accommodation.aggregate([
      {
        $lookup: {
          from: "reviews", // nombre de la colección de reviews
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
        $sort: { avgRating: -1 } // de mayor a menor puntuación
      }
    ]);

    res.json(accommodations);
  } catch (error) {
    next(error);
  }
});

router.get("/favorites", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("favorites");
    if (!user) return res.status(404).json({ message: "Debes identificarte primero" });

    if (!user.favorites.length) return res.json([]);

    const favorites = await Accommodation.find({ _id: { $in: user.favorites } });
    res.json(favorites);
  } catch (error) {
    next(error);
  }
});

router.get("/randomCity", async (req, res, next) => {
  try {
    const randomCityDoc = await Accommodation.aggregate([
      { $match: { city: { $ne: null } } },
      { $sample: { size: 1 } },
      { $project: { city: 1, _id: 0 } },
    ]);

    if (!randomCityDoc.length) {
      return res.status(404).json({ message: "No hay alojamientos con ciudad" });
    }

    const randomCity = randomCityDoc[0].city;
    const accommodations = await Accommodation.find({ city: randomCity });

    res.json({ city: randomCity, accommodations });
  } catch (error) {
    next(error);
  }
});


router.get("/own", async(req, res,next) => {
   const objectId  = req.query.objectId
  try {
    const response = await Accommodation.find({owner:objectId})
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

router.post("/", async (req, res, next) => {
  try {
    const response = await Accommodation.create({
      title: req.body.title,
      type: req.body.type,
      beds: req.body.beds,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      livingroom: req.body.livingroom,
      services: req.body.services,
      cost: req.body.cost,
      owner: req.body.owner,
      photos: req.body.photos,
      description: req.body.description,
      location: req.body.location,
      city: req.body.city
    });
    res.json(response).send("Anuncio creado con exito");
  } catch (error) {
    next(error);
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
