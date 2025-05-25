import { Response, Request, RequestHandler } from "express"
import { TMovie } from "../types/movie"
import { movieSchema } from "../zod/zod"
import { pool } from "../db"

export const addMovie: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { description, duration, genres, releaseDate, title }: TMovie = req.body
		const slug = title.toLowerCase().replace(" ", "-").trim()
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

		const { rows } = await pool.query(
			`SELECT * FROM movies where title = $1`,
			[title]
		)

		if(rows.length !== 0) {
			res.status(409).json({ message: "Movie with that title is already existing." })
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

		res.status(201).json({ result: newMovie.rows[0] })
	} catch(e) {
		console.error(e)
		res.status(500).json({ message: "Internal Server Error" })
	}
}

export const getMovies: RequestHandler = async (req: Request, res: Response) => {
	try {
		const movies = await pool.query(`SELECT * FROM movies ORDER BY created_at DESC`)

		res.status(200).json({ result: movies.rows })
	} catch(e) {
		console.error(e)
		res.status(500).json({ message: "Internal Server Error" })
	}
}

export const getMovieByTitle: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { slug } = req.params

		const { rows } = await pool.query(`SELECT * FROM movies where slug = $1`, [slug])

		if(rows.length === 0) {
			res.status(404).json({ message: "Movie not found" })
			return
		}

		res.status(200).json({ result: rows[0] })
	} catch(e) {
		console.error(e)
		res.status(500).json({ message: "Internal Server Error" })
	}
}

export const updateMovieById: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { id, releaseDate, description, title, genres, duration }: TMovie = req.body
		const slug = title.toLowerCase().replace(" ", "-").trim()
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

		const { rows } = await pool.query(
			`SELECT * FROM movies where title = $1`,
			[title]
		)

		if(rows.length === 0) {
			res.status(409).json({ message: "Movie with that title is not existing." })
			return
		}

		const updatedMovie = await pool.query(
			`
				UPDATE movies
				SET description = $1, duration = $2, genres = $3, release_date = $4, slug = $5, title = $6, updated_at = NOW()
				WHERE id = $7
				RETURNING *
			`,
			[description, duration, genres, releaseDate, slug, title, id]
		)

		res.status(200).json({ message: updatedMovie.rows })
	} catch(e) {
		console.error(e)
		res.status(500).json({ message: "Internal Server Error" })
	}
}
