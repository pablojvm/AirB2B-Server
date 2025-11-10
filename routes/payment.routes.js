const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const verifyToken = require("../middlewares/auth.middlewares");

const Payment = require("../models/Payment.model");
const Booking = require("../models/Booking.model");

router.post("/create-payment-intent", verifyToken, async (req, res, next) => {
  const productId = req.body.product;
  console.log(req.body);
  try {
    const product = await Booking.findById(productId);
    console.log(product)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.cost * 100,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await Payment.create({
      price: product.cost * 100,
      product: productId,
      status: "incomplete",
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      buyer: req.payload
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }

  router.patch("/update-payment-intent", verifyToken, async (req, res, next) => {
  const { clientSecret, paymentIntentId } = req.body;
  const userId = req.payload?._id;

  try {
    if (!paymentIntentId) {
      return res.status(400).json({ message: "paymentIntentId is required" });
    }

    // Actualiza el payment y popula el product -> accommodation -> owner
    const payment = await Payment.findOneAndUpdate(
      { paymentIntentId },
      { status: "succeeded", clientSecret: clientSecret || undefined },
      { new: true }
    ).lean();

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // 2) seguridad: comprobar que el buyer coincida con el usuario autenticado
    if (payment.buyer && payment.buyer.toString() !== userId) {
      return res.status(403).json({ message: "No autorizado para actualizar este pago" });
    }

    // 3) si el payment tiene asociado un product (booking), actualizar su estado
    let booking = null;
    if (payment.product) {
      // Si payment.product está poblado, puede ser objeto; si no, puede ser id.
      const bookingId = payment.product._id || payment.product;

      booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status: "accepted" },
        { new: true }
      )
        .populate({
          path: "accommodation",
          populate: {
            path: "owner"
          },
        })
        .lean();
    }

    return res.status(200).json({ payment, booking });
  } catch (error) {
    next(error);
  }
});


});

module.exports = router;
