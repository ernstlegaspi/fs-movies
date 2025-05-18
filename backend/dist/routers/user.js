"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const router = (0, express_1.Router)();
router.post("/sign-in", user_1.signIn);
router.post("/sign-up", user_1.signUp);
exports.default = router;
