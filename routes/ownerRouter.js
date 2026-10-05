const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

const ownerModel = require("../models/owner-model");
const productModel = require("../models/product-model");
const orderModel = require("../models/order-model");
const upload = require("../config/multer-config");
const { isLoggedIn, isOwner, JWT_SECRET } = require("../middlewares/auth");

const ADMIN_SECRET = config.has("ADMIN_SECRET") ? config.get("ADMIN_SECRET") : "let-me-in-admin";

router.get("/", function (req, res) {
    res.send("owner router works");
});


router.post("/register", async function (req, res) {
    try {
        const { fullname, email, password, gstin, adminSecret } = req.body;

        if (adminSecret !== ADMIN_SECRET) {
            return res.status(403).json({ success: false, message: "Invalid admin secret" });
        }

        const existing = await ownerModel.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: "Admin with this email already exists" });
        }

        const hash = await bcrypt.hash(password, 10);
        const owner = await ownerModel.create({ fullname, email, password: hash, gstin });

        const token = jwt.sign({ id: owner._id, role: "owner" }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

        res.status(201).json({
            success: true,
            owner: { id: owner._id, fullname: owner.fullname, email: owner.email },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/login", async function (req, res) {
    try {
        const { email, password } = req.body;
        const owner = await ownerModel.findOne({ email });
        if (!owner) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        const match = await bcrypt.compare(password, owner.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        const token = jwt.sign({ id: owner._id, role: "owner" }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
        res.json({ success: true, owner: { id: owner._id, fullname: owner.fullname, email: owner.email } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get("/logout", function (req, res) {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out" });
});

router.get("/me", isLoggedIn, isOwner, async function (req, res) {
    const owner = await ownerModel.findById(req.user.id).select("-password");
    res.json({ success: true, owner });
});

// ---- Product management (admin only) ----

router.post("/products", isLoggedIn, isOwner, upload.single("image"), async function (req, res) {
    try {
        const { name, price, discount, description, category, stock, bgcolor, panelcolor, textcolor } = req.body;
        const image = req.file ? `/images/uploads/${req.file.filename}` : req.body.image || "";

        const product = await productModel.create({
            name,
            price,
            discount: discount || 0,
            description,
            category,
            stock: stock || 0,
            bgcolor,
            panelcolor,
            textcolor,
            image,
        });

        res.status(201).json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put("/products/:id", isLoggedIn, isOwner, upload.single("image"), async function (req, res) {
    try {
        const updates = { ...req.body };
        if (req.file) {
            updates.image = `/images/uploads/${req.file.filename}`;
        }
        const product = await productModel.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete("/products/:id", isLoggedIn, isOwner, async function (req, res) {
    try {
        const product = await productModel.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        res.json({ success: true, message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.get("/orders", isLoggedIn, isOwner, async function (req, res) {
    try {
        const orders = await orderModel.find().populate("user", "fullname email").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put("/orders/:id/status", isLoggedIn, isOwner, async function (req, res) {
    try {
        const { status } = req.body;
        const order = await orderModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
