const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2; 
require('dotenv').config();
const cors = require('cors');

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

const app = express();
app.use(formidable());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
useNewUrlParser : true, useUnifiedTopology : true, useCreateIndex : true})

const userRoutes = require('./routes/user');
app.use(userRoutes);

const offerRoutes = require('./routes/offer');
app.use(offerRoutes);

app.get('https://my-vinted-backend-project.herokuapp.com/', (req, res) => {
  res.json("Bienvenue sur la page API Vinted");p
})

app.all("*", (req,res) => {
  res.status(404).json({error: "Page not found"})
})

app.listen(process.env.PORT, () => {
    console.log("Server has started")
});


