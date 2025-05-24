"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMovies = exports.addMovie = void 0;
const zod_1 = require("../zod/zod");
const db_1 = require("../db");
const addMovie = async (req, res) => {
    try {
        const { description, duration, genres, releaseDate, slug, title } = req.body;
        const result = zod_1.movieSchema.safeParse({ description, duration, genres, releaseDate, slug, title });
        if (result.error) {
            const err = result.error.flatten().fieldErrors;
            res.status(400).json({
                message: err.description?.[0] || err.duration?.[0]
                    || err.genres?.[0] || err.releaseDate?.[0]
                    || err.slug?.[0] || err.title?.[0] || "Invalid Request."
            });
            return;
        }
        const newMovie = await db_1.pool.query(`
				INSERT INTO movies (description, duration, genres, release_date, slug, title)
				VALUES ($1, $2, $3, $4, $5, $6)
				RETURNING *
			`, [description, duration, genres, releaseDate, slug, title]);
        console.log(newMovie);
        res.status(201).json({ data: "NICCE" });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.addMovie = addMovie;
const getMovies = async (req, res) => {
    try {
        const movies = await db_1.pool.query(`SELECT * FROM movies`);
        res.status(200).json({ result: movies.rows });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getMovies = getMovies;
