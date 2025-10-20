const router = require("express").Router();

const Accommodation = require("../models/Accommodation.model");

router.get("/", async(req, res,next) => {
  try {
    const city = req.query.city
    const response = await Accommodation.find({city})
    res.json(response)
  } catch (error) {
    next(error)
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
