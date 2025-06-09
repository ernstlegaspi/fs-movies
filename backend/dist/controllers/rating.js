"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRatingScore = void 0;
const db_1 = require("../db");
const zod_1 = require("../zod/zod");
const updateRatingScore = async (req, res) => {
    try {
        const { ratingId, score } = req.body;
        if (score < 0 || score > 10) {
            res.status(400).json({ message: "Invalid score." });
            return;
        }
        const result = zod_1.updateRatingSchema.safeParse({ ratingId, score });
        if (result.error) {
            const err = result.error.flatten().fieldErrors;
            res.status(400).json({ message: err.ratingId?.[0] || err.score?.[0] || "Invalid Request" });
            return;
        }
        const { rows } = await db_1.pool.query(`
				UPDATE ratings
				SET score = $1
				WHERE id = $2
				RETURNING *
			`, [score, ratingId]);
        res.status(200).json({ result: rows[0] });
    }
    catch (e) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.updateRatingScore = updateRatingScore;
