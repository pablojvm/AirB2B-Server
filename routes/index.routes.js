const router = require("express").Router();

const accommodationRouter = require("./accommodation.routes")
router.use("/accommodation", accommodationRouter)

const reviewRouter = require("./review.routes")
router.use("/review", reviewRouter)

const bookingRouter = require("./booking.routes")
router.use("/booking", bookingRouter)

const userRoutes = require(("./user.routes"))
router.use("/user", userRoutes)

const authRouter = require("./auth.routes")
router.use("/auth", authRouter)

const uploadRoutes = require("./upload.routes");
router.use("/upload", uploadRoutes);

const paymentRoutes = require("./payment.routes")
router.use("/payment", paymentRoutes)

module.exports = router;
