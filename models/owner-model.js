const mongoose = require("mongoose");

const ownerschema = mongoose.Schema({
    fullname: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
    },
    password: String,
    products: {
        type: Array,
        default: [],
    },
    gstin: String,
    picture: String,
});

module.exports = mongoose.model("owner", ownerschema);
