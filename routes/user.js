const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User"); 


router.post("/user/signup/", async (req,res) => {
try {
const {email, phone, username, password} = req.fields;
const salt = uid2(16);
const hash = SHA256(password + salt).toString(encBase64);
const token = uid2(16);

const emailtoFind = await User.findOne({ email : email });
if (emailtoFind) {
    res.status(400).json({message : 'Email already exists in the DB'})
} else if (username) { 
    console.log("it works till now")
    const newUser = new User({
    email: email,
    account: { 
    username: username,
    phone: phone },
    token: token,
    hash: hash,
    salt: salt,
    });

const result = await cloudinary.uploader.upload(req.files.picture.path, {folder : `/vinted/user/${newUser.id}`});
newUser.avatar = result ; 
await newUser.save();

res.status(200).json({account :{ username : username, phone : phone}, id : newUser.id, token : token});
} else {res.json({message : "Username is missing"})}
}
catch (error) {
res.status(400).json({message : error.message})   
    }})


router.post("/user/login/", async (req,res) => {
    try {
    const { email, password } = req.fields; 
        const user = await User.findOne({email : email});
    if(user){
        const hash = SHA256(password + user.salt).toString(encBase64);
        
         if (hash === user.hash) {
            res.status(200).json({id: user.id, token : user.token, account : user.account});
        } else { res.status(400).json({message : "Authentification is not possible"}) };

     } else {res.status(400).json("User not found")}
        } catch (error) {
        res.status(400).json({message : error.message})  
        }
        });

module.exports = router;
