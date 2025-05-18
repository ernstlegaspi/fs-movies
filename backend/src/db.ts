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

export const dropTable = async () => {
	try {
		await pool.query(`DROP TABLE IF EXISTS users`)
	} catch(e) {
		throw new Error("Cannot drop table")
	}
}
