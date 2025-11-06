const router = require("express").Router();
const Review = require("../models/Review.model")
const verifyToken = require("../middlewares/auth.middlewares")

router.post(("/"), verifyToken, async(req, res,next) => {
  try {
    const response = await Review.create({
      title: req.body.title,
      text: req.body.text,
      stars: req.body.stars,
      creator: req.body.creator,
      accommodation: req.body.accommodation
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
    const response = await Review.find({ creator: userId }).populate("accommodation", "title");
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/:accommodationId", async (req, res, next) => {
  try {
    const { accommodationId } = req.params;

    if (!accommodationId) {
      return res.status(400).json({ message: "accommodationId is required" });
    }

    const reviews = await Review.find({ accommodation: accommodationId })
      .populate("creator", "username photo") // trae solo username y photo
      .sort({ createdAt: -1 }); // más recientes primero

    return res.json(reviews);
  } catch (error) {
    next(error);
  }
});

module.exports = router