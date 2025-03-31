const jwt = require("jsonwebtoken");
const User = require("../models/user-model");
const JWT_SECRET= process.env.JWT_SECRET;

 
async function authMiddleware(req, res, next){
    const token = req.headers.authorization;
    if(!token) {
        return res.status(403).json({
            message: "No token provided"
        })
    }

    const bearerToken = token.split(" ")[1];
    try {
        const response = jwt.verify(bearerToken, JWT_SECRET);
       
        const user = await User.findOne({ email: response.email });
        if(!user){
            return res.status(403).json({
                message: "Unauthorized: User not found"
            });
        }
            req.user = user;
            next();
    } catch (error) {
        res.status(403).json({
            message: "Invalid token",
            error
        });
    }
}


module.exports =  authMiddleware;
