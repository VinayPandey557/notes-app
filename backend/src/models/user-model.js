const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: { type: String },
    email: { type: String,
         unique: true 
        },
    password: { type: String },
    createdOn: { type: Date , default: Date.now },
});


const User = mongoose.model("User", userSchema);



module.exports = User;