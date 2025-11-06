const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const verifyToken = require("../middlewares/auth.middlewares");

const Payment = require("../models/Payment.model");
const Booking = require("../models/Booking.model");

router.post("/create-payment-intent", verifyToken, async (req, res, next) => {
  const productId = req.body.product; // this is how we will receive the productId the user is trying to purchase. This can also later be set to receive via params.
  console.log(req.body);
  try {
    // TODO . this is where you will later get the correct price to be paid
    const product = await Booking.findById(productId);
    console.log(product)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.cost * 100, // this is an example for an amount of 14 EUR used for testing.
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // TODO on part 2. this is where you will later create a Payment Document later
    await Payment.create({
      price: product.cost * 100,
      product: productId,
      status: "incomplete",
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      // buyer: req.payload // example to add who bought the product (not done in this example)
    });

    res.send({
      clientSecret: paymentIntent.client_secret, // the client secret will be sent to the FE after the stripe payment intent creation
    });
  } catch (error) {
    next(error);
  }

  router.patch("/update-payment-intent", verifyToken, async (req, res, next) => {
  const { clientSecret, paymentIntentId } = req.body;
  const userId = req.payload?._id; // viene de verifyToken

  try {
    if (!paymentIntentId) {
      return res.status(400).json({ message: "paymentIntentId is required" });
    }

    // 1) buscar y actualizar el payment por paymentIntentId
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
      booking = await Booking.findByIdAndUpdate(
        payment.product,
        { status: "accepted" }, // estado corregido
        { new: true }
      ).lean();
    }

    return res.status(200).json({ payment, booking });
  } catch (error) {
    next(error);
  }
});

});

module.exports = router;
