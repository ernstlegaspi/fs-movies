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
		throw new Error("Erorr creating user table.")
	}
}

export const createMovieTable = async () => {
	try {
		await pool.query(`
			CREATE TABLE IF NOT EXISTS movies (
				id SERIAL PRIMARY KEY,
				created_at TIMESTAMP DEFAULT NOW(),
				updated_at TIMESTAMP DEFAULT NOW(),
				description TEXT NOT NULL,
				title TEXT NOT NULL,
				genres TEXT[] NOT NULL,
				release_date DATE NOT NULL,
				duration INTEGER NOT NULL,
				slug TEXT NOT NULL
			)
		`)
	} catch(e) {
		throw new Error("Error creating movie table.")
	}
}

export const dropTables = async () => {
	try {
		await Promise.all([
			pool.query(`DROP TABLE IF EXISTS users`),
			pool.query(`DROP TABLE IF EXISTS movies`)
		])

		console.log("Tables dropped")
	} catch(e) {
		throw new Error("Cannot drop table")
	}
}
