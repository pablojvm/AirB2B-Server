const router = require("express").Router();

const Review = require("../models/Review.model")

const verifyToken = require("../middlewares/auth.middlewares")

router.post(("/"), async(req, res,next) => {
  try {
    const response = await Review.create({
      title: req.body.title,
      text: req.body.text,
      stars: req.body.stars,
      creator: req.body.creator,
      ad: req.body.ad
    })
    res.json(response)
  } catch (error) {
    next(error)
  }
})

router.patch("/:reviewId", verifyToken, async(req, res, next) =>{
  try {
    const response = await Review.findByIdAndUpdate(req.params.reviewId, {
      title: req.body.title,
      text: req.body.text,
      stars: req.body.stars
    })
    res.json(response).send("Reseña actualizada")
  } catch (error) {
    next(error)
  }
})

router.delete("/:reviewId", verifyToken, async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.reviewId)
    res.send("Reseña borrada")
  } catch (error) {
    next(error)
  }
})

router.get("/own", verifyToken, async (req, res, next) => {
  const userId = req.payload._id
  try {
    const response = await Review.find({ creator: userId }).populate("ad", "title");
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/:adId", async(req, res,next) => {
  console.log(req.params)
  try {
    const { adId } = req.params;
    const response = await Review.find({ ad: adId })
    .populate("creator")
    res.json(response)
  } catch (error) {
    next(error)
  }
})

module.exports = router