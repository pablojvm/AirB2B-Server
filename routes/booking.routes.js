const router = require("express").Router();

const Booking = require("../models/Booking.model")

const verifyToken = require("../middlewares/auth.middlewares")
