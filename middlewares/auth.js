const jwt = require("jsonwebtoken");
const config = require("config");

const JWT_SECRET = config.has("JWT_SECRET") ? config.get("JWT_SECRET") : "carrycraft_dev_secret";

function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Please login first" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired session" });
    }
}

function isOwner(req, res, next) {
    if (!req.user || req.user.role !== "owner") {
        return res.status(403).json({ success: false, message: "Admin access only" });
    }
    next();
}

module.exports = { isLoggedIn, isOwner, JWT_SECRET };
