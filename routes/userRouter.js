const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("../models/user-model");
const productModel = require("../models/product-model");
const orderModel = require("../models/order-model");
const { isLoggedIn, JWT_SECRET } = require("../middlewares/auth");

router.get("/", function (req, res) {
    res.send("user router works");
});

router.post("/register", async function (req, res) {
    try {
        const { fullname, email, password, contact } = req.body;

        const existing = await userModel.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: "An account with this email already exists" });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await userModel.create({ fullname, email, password: hash, contact });

        const token = jwt.sign({ id: user._id, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

        res.status(201).json({
            success: true,
            user: { id: user._id, fullname: user.fullname, email: user.email },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/login", async function (req, res) {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        const token = jwt.sign({ id: user._id, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
        res.json({ success: true, user: { id: user._id, fullname: user.fullname, email: user.email } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get("/logout", function (req, res) {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out" });
});

router.get("/me", isLoggedIn, async function (req, res) {
    const user = await userModel.findById(req.user.id).select("-password");
    res.json({ success: true, user });
});



router.get("/cart", isLoggedIn, async function (req, res) {
    try {
        const user = await userModel.findById(req.user.id);
        const productIds = user.cart.map((item) => item.product);
        const products = await productModel.find({ _id: { $in: productIds } });

        const cart = user.cart.map((item) => {
            const product = products.find((p) => p._id.toString() === item.product.toString());
            return { product, quantity: item.quantity };
        });

        res.json({ success: true, cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/cart/add", isLoggedIn, async function (req, res) {
    try {
        const { productId, quantity } = req.body;
        const user = await userModel.findById(req.user.id);

        const existingItem = user.cart.find((item) => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity || 1;
        } else {
            user.cart.push({ product: productId, quantity: quantity || 1 });
        }
        user.markModified("cart");
        await user.save();

        res.json({ success: true, cart: user.cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/cart/update", isLoggedIn, async function (req, res) {
    try {
        const { productId, quantity } = req.body;
        const user = await userModel.findById(req.user.id);
        const item = user.cart.find((i) => i.product.toString() === productId);
        if (item) {
            item.quantity = quantity;
        }
        user.markModified("cart");
        await user.save();
        res.json({ success: true, cart: user.cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/cart/remove", isLoggedIn, async function (req, res) {
    try {
        const { productId } = req.body;
        const user = await userModel.findById(req.user.id);
        user.cart = user.cart.filter((item) => item.product.toString() !== productId);
        user.markModified("cart");
        await user.save();
        res.json({ success: true, cart: user.cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---- Orders ----

router.post("/order", isLoggedIn, async function (req, res) {
    try {
        const { address, contact } = req.body;
        const user = await userModel.findById(req.user.id);

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty" });
        }

        const productIds = user.cart.map((item) => item.product);
        const products = await productModel.find({ _id: { $in: productIds } });

        let totalAmount = 0;
        const items = user.cart.map((cartItem) => {
            const product = products.find((p) => p._id.toString() === cartItem.product.toString());
            const finalPrice = product.price - (product.price * (product.discount || 0)) / 100;
            totalAmount += finalPrice * cartItem.quantity;
            return {
                product: product._id,
                name: product.name,
                image: product.image,
                price: finalPrice,
                quantity: cartItem.quantity,
            };
        });

        const order = await orderModel.create({
            user: user._id,
            items,
            totalAmount,
            address,
            contact,
        });

        user.orders.push(order._id);
        user.cart = [];
        await user.save();

        res.status(201).json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get("/orders", isLoggedIn, async function (req, res) {
    try {
        const orders = await orderModel.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
