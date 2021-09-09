const express = require("express");
const router = express.Router();
const createStripe = require("stripe");
const formidableMiddleware = require("express-formidable");
router.use(formidableMiddleware());

/* Votre clé privée doit être indiquée ici */
const stripe = createStripe(process.env.STRIPE_API_SECRET);

// on réceptionne le token
router.post("/payment", async (req, res) => {
  try {
    const stripeToken = req.fields.token;
    console.log("STRIPETOKEN==>", stripeToken);

    const response = await stripe.charges.create({
      amount: req.fields.amount * 100,
      currency: "eur",
      title: req.fields.title,
      source: stripeToken,
    });
    // Le paiement a fonctionné
    // TO DO : MàJ base de données
    // Réponse au client pour afficher un message de statut:
    res.json(response);
    console.log(response.data);
  } catch (error) {
    console.log(error.message);
    res.status(400).json("Error =", error.response);
  }
});

module.exports = router;
