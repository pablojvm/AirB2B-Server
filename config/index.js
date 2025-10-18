function config(app) {
  const express = require("express"); // routes and middlewares
  const cors = require("cors");  
  const morgan = require("morgan")  

  app.set("trust proxy", 1);
  app.use(morgan("dev"))
  app.use(cors({ origin: [process.env.ORIGIN] }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
}

module.exports = config;