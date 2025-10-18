const router = require("express").Router();

const Ad = require("../models/Ad.model");

router.get("/", async(req, res,next) => {
  try {
    const city = req.query.city
    const response = await Ad.find({city})
    res.json(response)
  } catch (error) {
    next(error)
  }
});

router.get("/own", async(req, res,next) => {
   const objectId  = req.query.objectId
  try {
    const response = await Ad.find({owner:objectId})
    res.json(response)
  } catch (error) {
    next(error)
  }
});

router.get("/:adId", async(req, res,next) => {
 
  try {
    console.log(req.params)
    const response = await Ad.findById(req.params.adId)
    .populate("owner")
    res.json(response)
  } catch (error) {
    next(error)
  }
})

router.post("/", async (req, res, next) => {
  try {
    const response = await Ad.create({
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

router.patch("/:adId", async(req, res, next) =>{
  try {
    const response = await Ad.findByIdAndUpdate(req.params.adId, {
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

router.delete("/:adId", async (req, res,next) => {
  try {
    await Ad.findByIdAndDelete(req.params.adId)
    res.send("Anuncio borrado")
  } catch (error) {
    next(error)
  }
})

module.exports = router;
