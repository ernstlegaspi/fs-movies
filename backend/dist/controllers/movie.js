"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopRatedMovies = exports.getRecentMovies = exports.getMoviesByGenres = exports.deleteMovieById = exports.updateMovieById = exports.getMovieByTitle = exports.getMovies = exports.addMovie = void 0;
const zod_1 = require("../zod/zod");
const db_1 = require("../db");
const redis_1 = require("../lib/redis");
/*
 GET
 top rated
 movie recommendations

*/
const addMovie = async (req, res) => {
    try {
        const { description, duration, genres, releaseDate, title } = req.body;
        const slug = title.toLowerCase().replaceAll(" ", "-").trim();
        const modifiedGenres = genres.map(v => v.toLowerCase());
        const result = zod_1.movieSchema.safeParse({
            description,
            duration,
            genres: modifiedGenres,
            releaseDate,
            slug,
            title
        });
        if (result.error) {
            const err = result.error.flatten().fieldErrors;
            res.status(400).json({
                message: err.description?.[0] || err.duration?.[0]
                    || err.genres?.[0] || err.releaseDate?.[0]
                    || err.slug?.[0] || err.title?.[0] || "Invalid Request."
            });
            return;
        }
        const { rows } = await db_1.pool.query(`SELECT * FROM movies where title = $1`, [title]);
        if (rows.length !== 0) {
            res.status(409).json({ message: "Movie with that title is already existing." });
            return;
        }
        const newMovie = await db_1.pool.query(`
				INSERT INTO movies (description, duration, genres, release_date, slug, title)
				VALUES ($1, $2, $3, $4, $5, $6)
				RETURNING *
			`, [description, duration, modifiedGenres, releaseDate, slug, title]);
        res.status(201).json({ result: newMovie.rows[0] });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.addMovie = addMovie;
const getMovies = async (req, res) => {
    try {
        const redis = await (0, redis_1.initClient)();
        const key = "movies:all";
        const result = await redis.get(key);
        if (result) {
            res.status(200).json({ cached: true, result: JSON.parse(result) });
            return;
        }
        const { rows } = await db_1.pool.query(`SELECT * FROM movies ORDER BY created_at DESC`);
        await redis.set(key, JSON.stringify(rows), { EX: 120 });
        res.status(200).json({ cached: false, result: rows });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getMovies = getMovies;
const getMovieByTitle = async (req, res) => {
    try {
        const { slug } = req.params;
        const redis = await (0, redis_1.initClient)();
        const key = `movie:${slug}`;
        const result = await redis.get(key);
        if (result) {
            res.status(200).json({ cached: true, result: JSON.parse(result) });
            return;
        }
        const { rows } = await db_1.pool.query(`SELECT * FROM movies where slug = $1`, [slug]);
        if (rows.length === 0) {
            res.status(404).json({ message: "Movie not found" });
            return;
        }
        await redis.set(key, JSON.stringify(rows[0]), { EX: 120 });
        res.status(200).json({ cached: false, result: rows[0] });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getMovieByTitle = getMovieByTitle;
const updateMovieById = async (req, res) => {
    try {
        const { id, releaseDate, description, title, genres, duration } = req.body;
        const slug = title.toLowerCase().replace(" ", "-").trim();
        const result = zod_1.movieSchema.safeParse({ description, duration, genres, releaseDate, slug, title });
        const redis = await (0, redis_1.initClient)();
        if (result.error) {
            const err = result.error.flatten().fieldErrors;
            res.status(400).json({
                message: err.description?.[0] || err.duration?.[0]
                    || err.genres?.[0] || err.releaseDate?.[0]
                    || err.slug?.[0] || err.title?.[0] || "Invalid Request."
            });
            return;
        }
        const { rows } = await db_1.pool.query(`SELECT * FROM movies where title = $1`, [title]);
        if (rows.length === 0) {
            res.status(409).json({ message: "Movie with that title is not existing." });
            return;
        }
        const updatedMovie = await db_1.pool.query(`
				UPDATE movies
				SET description = $1, duration = $2, genres = $3, release_date = $4, slug = $5, title = $6, updated_at = NOW()
				WHERE id = $7
				RETURNING *
			`, [description, duration, genres, releaseDate, slug, title, id]);
        await redis.del(`movie:${slug}`);
        res.status(200).json({ result: updatedMovie.rows });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.updateMovieById = updateMovieById;
const deleteMovieById = async (req, res) => {
    try {
        const { id, slug } = req.params;
        const redis = await (0, redis_1.initClient)();
        const { rows } = await db_1.pool.query(`DELETE FROM movies where id = $1 RETURNING *`, [id]);
        if (rows.length === 0) {
            res.status(404).json({ message: "Movie not found" });
            return;
        }
        await redis.del(`movie:${slug}`);
        res.status(200).json({ result: "Movie Deleted" });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.deleteMovieById = deleteMovieById;
const getMoviesByGenres = async (req, res) => {
    try {
        const { genres } = req.params;
        const genresArr = genres.split("-");
        const { rows } = await db_1.pool.query(`SELECT * FROM movies WHERE genres && $1::TEXT[] ORDER BY created_at DESC`, [genresArr]);
        res.status(200).json({ result: rows });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getMoviesByGenres = getMoviesByGenres;
const getRecentMovies = async (req, res) => {
    try {
        const redis = await (0, redis_1.initClient)();
        const key = "movie:recent";
        const result = await redis.get(key);
        if (result) {
            res.status(200).json({ cached: true, result: JSON.parse(result) });
            return;
        }
        const { rows } = await db_1.pool.query("SELECT * FROM movies ORDER BY CREATED_AT DESC LIMIT 10");
        await redis.set(key, JSON.stringify(rows), { EX: 120 });
        res.status(200).json({ cached: false, result: rows });
    }
    catch (e) {
        res.status(500).json({ message: "Internal Server ERror" });
    }
};
exports.getRecentMovies = getRecentMovies;
const getTopRatedMovies = async (req, res) => {
    try {
        await db_1.pool.query(`
			SELECT m.* AVG(r.score) AS average_rating
			FROM movies m
			JOIN ratings r ON m.id = r.movie_id
			GROUP BY m.id
			ORDER BY average_rating DESC
			LIMIT 1
		`);
    }
    catch (e) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getTopRatedMovies = getTopRatedMovies;
