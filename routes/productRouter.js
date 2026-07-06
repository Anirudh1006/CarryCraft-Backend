const express = require("express");
const router = express.Router();
const productModel = require("../models/product-model");

// GET /product?search=tote&category=leather&minPrice=0&maxPrice=5000
router.get("/", async function (req, res) {
    try {
        const { search, category, minPrice, maxPrice } = req.query;
        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }
        if (category) {
            filter.category = category;
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const products = await productModel.find(filter);
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get("/:id", async function (req, res) {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
