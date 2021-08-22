const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/isAuthenticated");

const Offer = require("../models/Offer");

// 1ère route pour publier l'annonce
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const { title, description, price, condition, city, brand, size, color } =
      req.fields;

    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { condition: condition },
        { city: city },
        { brand: brand },
        { size: Number(size) },
        { color: color },
      ],
      owner: req.user,
    });
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted/offer/${newOffer.id}`,
    });
    newOffer.product_image = result;
    await newOffer.save();

    res.status(200).json(newOffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2ème route pour trier les résultats
router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax } = req.query;
    const filters = {};
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMin) {
      filters.product_price = { $gte: Number(priceMin) };
    }
    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(priceMax);
      } else {
        filters.product_price = { $lte: Number(priceMax) };
      }
    }
    const sort = {};

    if (req.query.sort === "price-desc") {
      sort.product_price = -1;
    }
    if (req.query.sort === "price-asc") {
      sort.product_price = 1;
    }

    let page = Number(req.query.page);
    let limit = Number(req.query.limit);

    if (page < 1) {
      page = 1;
    } else {
      page = Number(page);
    }

    const count = await Offer.countDocuments(filters);

    const offers = await Offer.find(filters)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("owner", "account");

    res.status(200).json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3ème route pour effacer l'annonce :
router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  const offerToDelete = await Offer.findByIdAndDelete(req.fields.id);
  res.status(200).json({ message: "Offer was deleted" });
});

// 4ème route pour modifier l'annonce :
router.put("/offer/update", isAuthenticated, async (req, res) => {
  try {
    const { title, description, price, condition, brand, size, color, id } =
      req.fields;
    const offerToModify = await Offer.findById(id);
    if (title) {
      offerToModify.product_name = title;
    }
    if (description) {
      offerToModify.product_description = description;
    }
    if (price) {
      offerToModify.product_price = Number(price);
    }

    const details = offerToModify.product_details;

    for (let i = 0; i < details.length; i++) {
      if (condition) {
        if (details[i].condition) {
          details[i].condition = condition;
        }
      }
      if (brand) {
        if (details[i].brand) {
          details[i].brand = brand;
        }
      }
      if (size) {
        if (details[i].size) {
          details[i].size = size;
        }
      }
      if (color) {
        if (details[i].color) {
          details[i].color = color;
        }
      }
    }
    offerToModify.markModified("product_details");
    await offerToModify.save();

    res.status(200).json({ message: "Offer was updated" });
    console.log(offerToModify);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5ème route pour retrouver l'offre par son ID
router.get("/offer/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const offers = await Offer.findById(id).populate("owner", "account");
    res.status(200).json(offers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
