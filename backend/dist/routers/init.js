"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/csrf", (req, res) => {
    res.cookie("XSRF-TOKEN", req.csrfToken(), {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    });
    res.status(200).json({ message: "Token set" });
});
exports.default = router;
