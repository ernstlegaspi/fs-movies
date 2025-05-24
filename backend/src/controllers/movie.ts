import { Response, Request, RequestHandler } from "express"
import { TMovie } from "../types/movie"
import { movieSchema } from "../zod/zod"
import { pool } from "../db"

export const addMovie: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { description, duration, genres, releaseDate, slug, title }: TMovie = req.body
		const result = movieSchema.safeParse({ description, duration, genres, releaseDate, slug, title })

		if(result.error) {
			const err = result.error.flatten().fieldErrors

			res.status(400).json({
				message: err.description?.[0] || err.duration?.[0]
					|| err.genres?.[0] || err.releaseDate?.[0]
					|| err.slug?.[0] || err.title?.[0] || "Invalid Request."
			})

			return
		}

		const newMovie = await pool.query(
			`
				INSERT INTO movies (description, duration, genres, release_date, slug, title)
				VALUES ($1, $2, $3, $4, $5, $6)
				RETURNING *
			`,
			[description, duration, genres, releaseDate, slug, title]
		)

		console.log(newMovie)
		res.status(201).json({ data: "NICCE" })
	} catch(e) {
		console.log(e)
		res.status(500).json({ message: "Internal Server Error" })
	}
}

export const getMovies: RequestHandler = async (req: Request, res: Response) => {
	try {
		const movies = await pool.query(`SELECT * FROM movies ORDER BY created_at DESC`)

		res.status(200).json({ result: movies.rows })
	} catch(e) {
		console.log(e)
		res.status(500).json({ message: "Internal Server Error" })
	}
}

export const getMovieById: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { id } = req.params

		if(!id) {
			res.status(404).json({ message: "Error: 404 not found" })
			return
		}
		
		const movie = await pool.query(`SELECT * FROM movies where id = $1`, [id])
	} catch(e) {
		console.log(e)
		res.status(500).json({ message: "Internal Server Error" })
	}
}
