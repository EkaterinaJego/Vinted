const express = require("express");
const router = express.Router();
const createStripe = require("stripe");
const formidable = require("express-formidable");

router.use(formidable());
const Offer = require("../models/Offer");

// Clé privée de Stripe :
const stripe = createStripe(process.env.STRIPE_SECRET_KEY);

router.post("/payment", async (req, res) => {
  try {
    const { amount, title, token, _id } = req.fields;

    // On reçoit un token et les informations sur l'article :

    const response = await stripe.charges.create({
      amount: amount * 100,
      currence: "eur",
      description: `Paiement pour ${title}`,
      token: token,
    });
    const findArticle = await Offer.findByIdAndDelete(_id);
    if (response.status === "succeeded") {
      res.json({
        status: "succeeded",
        article: findArticle,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
