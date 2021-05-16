
const User = require("../models/User"); 
const Offer = require("../models/Offer");

const isAuthenticated = async (req, res, next) => {
if (req.headers.authorization) {
    const user = await User.findOne({ token : req.headers.authorization.replace("Bearer ", "")}).select("id token account");
    if (!user) {
    return res.status(401).json({error : "Unauthorized"}) }
    else {
    req.user = user;
    return next();
    }}
    else { 
    return res.status(401).json({error : "No headers"})
    }
}

module.exports = isAuthenticated; 

