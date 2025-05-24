"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const movie_1 = require("../controllers/movie");
const router = (0, express_1.Router)();
router.post("/movie", middleware_1.sessionMiddleware, movie_1.addMovie);
router.get("/movies", movie_1.getMovies);
exports.default = router;
