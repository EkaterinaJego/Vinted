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

    const response = await stripe.charges.create({
      amount: req.fields.amount * 100,
      currency: "eur",
      title: req.fields.title,
      source: stripeToken,
    });
    // Le paiement a fonctionné
    // On peut mettre à jour la base de données
    // On renvoie une réponse au client pour afficher un message de statut
    res.json(response);
    console.log(status);
  } catch (error) {
    console.log(error.message);
    res.status(400).json("Error =", error.message);
  }
});

module.exports = router;
