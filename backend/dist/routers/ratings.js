"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rating_1 = require("../controllers/rating");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.put("/", middleware_1.sessionMiddleware, rating_1.updateRatingScore);
exports.default = router;
