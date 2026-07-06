const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "product",
                },
                name: String,
                image: String,
                price: Number,
                quantity: Number,
            },
        ],
        totalAmount: Number,
        address: String,
        contact: Number,
        status: {
            type: String,
            enum: ["placed", "shipped", "delivered", "cancelled"],
            default: "placed",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("order", orderSchema);
