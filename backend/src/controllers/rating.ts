import type { RequestHandler } from "express"

import { Request, Response } from "express"

import { pool } from "../db"
import { TUpdateRating } from "../types/rating"
import { updateRatingSchema } from "../zod/zod"

export const getTopRatedMovies: RequestHandler = async (req: Request, res: Response) => {
	try {
		await pool.query(`
			SELECT m.* AVG(r.score) AS average_rating
			FROM movies m
			JOIN ratings r ON m.id = r.movie_id
			GROUP BY m.id
			ORDER BY average_rating DESC
			LIMIT 1
		`)
	} catch(e) {
		res.status(500).json({ message: "Internal Server Error" })
	}
}

export const updateRatingScore: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { ratingId, score }: TUpdateRating = req.body

		if(score < 0 || score > 10) {
			res.status(400).json({ message: "Invalid score." })
			return
		}

		const result = updateRatingSchema.safeParse({ ratingId, score })

		if(result.error) {
			const err = result.error.flatten().fieldErrors

			res.status(400).json({ message: err.ratingId?.[0] || err.score?.[0] || "Invalid Request" })

			return
		}

		const { rows } = await pool.query(
			`
				UPDATE ratings
				SET score = $1
				WHERE id = $2
				RETURNING *
			`,
			[score, ratingId]
		)

		res.status(200).json({ result: rows[0] })
	} catch(e) {
		res.status(500).json({ message: "Internal Server Error" })
	}
}
