import type { RedisClientType } from "redis"

import { Response, Request, RequestHandler } from "express"
import { TMovie } from "../types/movie"
import { movieSchema } from "../zod/zod"
import { pool } from "../db"
import { initClient } from "../lib/redis"

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
		const redis: RedisClientType = await initClient()
		const key = "movies:all"

		const result = await redis.get(key)

		if(result) {
			res.status(200).json({ cached: true, result: JSON.parse(result) })
			return
		}
		
		const { rows } = await pool.query(`SELECT * FROM movies ORDER BY created_at DESC`)

		await redis.set(key, JSON.stringify(rows), { EX: 120 })

		res.status(200).json({ cached: false, result: rows })
	} catch(e) {
		console.error(e)
		res.status(500).json({ message: "Internal Server Error" })
	}
}

export const getMovieByTitle: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { slug } = req.params
		const redis: RedisClientType = await initClient()
		const key = `movie:${slug}`

		const result = await redis.get(key)

		if(result) {
			res.status(200).json({ cached: true, result: JSON.parse(result) })
			return
		}

		const { rows } = await pool.query(`SELECT * FROM movies where slug = $1`, [slug])

		if(rows.length === 0) {
			res.status(404).json({ message: "Movie not found" })
			return
		}

		await redis.set(key, JSON.stringify(rows[0]), { EX: 120 });

		res.status(200).json({ cached: false, result: rows[0] })
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
		const redis: RedisClientType = await initClient()

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

		await redis.del(`movie:${slug}`)

		res.status(200).json({ message: updatedMovie.rows })
	} catch(e) {
		console.error(e)
		res.status(500).json({ message: "Internal Server Error" })
	}
}
