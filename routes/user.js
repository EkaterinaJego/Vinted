const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;
const Offer = require("../models/Offer");
const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const { email, phone, username, password } = req.fields;
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(16);

    const emailtoFind = await User.findOne({ email: email });

    if (emailtoFind) {
      res.status(400).json({ message: "Email already exists in the DB" });
    } else if (username && email && password) {
      const newUser = new User({
        email: email,
        account: {
          username: username,
          phone: phone,
        },
        token: token,
        hash: hash,
        salt: salt,
      });

      if (req.files.picture) {
        const result = await cloudinary.uploader.upload(
          req.files.picture.path,
          { folder: `/vinted/user/${newUser.id}` }
        );
        newUser.avatar = result;
        await newUser.save();
      }
      console.log(newUser);
      res.status(200).json({
        account: { username: username, phone: phone },
        id: newUser.id,
        token: token,
      });
    } else {
      res.json({ message: "Username is missing" });
    }
  } catch (error) {
    res.status(400).json({ message: "Something went wrong" });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;
    const user = await User.findOne({ email: email });
    if (user) {
      const hash = SHA256(password + user.salt).toString(encBase64);
      if (hash === user.hash) {
        res
          .status(200)
          .json({ id: user.id, token: user.token, account: user.account });
        console.log(user);
      } else {
        res.status(401).json({ message: "Authentification is not possible" });
      }
    } else {
      res.status(400).json("This user not found");
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
