const express = require("express");
const router = express.Router();

// uid2 et crypto-js sont des packages pour encrypter le mot de passe
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const cloudinary = require("cloudinary").v2;
const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  const { email, phone, username, password } = req.fields;

  try {
    const emailToFind = await User.findOne({ email: email });

    if (emailToFind) {
      res.status(409).json({ message: "Email already exists in the DB" });
    } else {
      if (username && email && password) {
        const token = uid2(64);
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);

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
        }

        await newUser.save();
        res.status(200).json({
          id: newUser.id,
          email: newUser.email,
          token: newUser.token,
          phone: newUser.phone,
          username: newUser.username,
        });
      } else {
        res.json("Some parameters are missing");
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;
    const userToFind = await User.findOne({ email: email });

    if (userToFind) {
      console.log("This user : ", userToFind);
      console.log("user hash : ", userToFind.hash);
      const hash = SHA256(password + userToFind.salt).toString(encBase64);
      if (hash === userToFind.hash) {
        res.status(200).json({
          id: userToFind.id,
          token: userToFind.token,
          account: userToFind.account,
        });
        console.log(userToFind);
      } else {
        res.status(401).json({ message: "Authentification is not possible" });
      }
    } else {
      res.status(400).json("User not found");
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
