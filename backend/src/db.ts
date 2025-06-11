import dotenv from "dotenv"
import pg from "pg"

dotenv.config()

const { Pool } = pg

export const pool = new Pool({
	connectionString: process.env.DATABASE_URL
})

export const createUserTable = async () => {
	try {
		await pool.query(`
			CREATE TABLE IF NOT EXISTS users (
				id SERIAL PRIMARY KEY,
				name TEXT NOT NULL,
				email TEXT UNIQUE NOT NULL,
				password TEXT NOT NULL
			)
		`)

		console.log("user table created")
	} catch(e) {
		console.error(e)
		throw new Error("Erorr creating user table.")
	}
}

export const createRatingsTable = async () => {
	try {
		await pool.query(`
			CREATE TABLE IF NOT EXISTS ratings (
				id SERIAL PRIMARY KEY,
				movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
				score INTEGER NOT NULL CHECK (score > -1 AND score <= 10),
				created_at TIMESTAMP DEFAULT NOW()
			)
		`)
	} catch(e) {
		console.error(e)
		throw new Error("Error creating ratings table.")
	}
}

export const createMovieTable = async () => {
	try {
		await pool.query(`
			CREATE TABLE IF NOT EXISTS movies (
				id SERIAL PRIMARY KEY,
				casts TEXT[],
				created_at TIMESTAMP DEFAULT NOW(),
				updated_at TIMESTAMP DEFAULT NOW(),
				description TEXT NOT NULL,
				title TEXT NOT NULL UNIQUE,
				genres TEXT[] NOT NULL,
				productions TEXT[],
				release_date DATE NOT NULL,
				duration INTEGER NOT NULL,
				slug TEXT NOT NULL
			)
		`)
	} catch(e) {
		console.error(e)
		throw new Error("Error creating movie table.")
	}
}

export const dropTables = async () => {
	try {
		await Promise.all([
			pool.query(`DROP TABLE IF EXISTS users`),
			pool.query(`DROP TABLE IF EXISTS movies`),
			pool.query(`DROP TABLE IF EXISTS ratings CASCADE`)
		])

		console.log("Tables dropped")
	} catch(e) {
		console.error(e)
		throw new Error("Cannot drop table")
	}
}
