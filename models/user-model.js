const mongoose = require("mongoose");

const userschema = mongoose.Schema({
    fullname: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    contact: Number,
    picture: String,
    cart: {
        type: Array,
        default: [],
    },
    orders: {
        type: Array,
        default: [],
    },
});

module.exports = mongoose.model("user", userschema);
