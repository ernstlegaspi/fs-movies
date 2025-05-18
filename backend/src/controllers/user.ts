import bcrypt from "bcrypt"
import { Request, RequestHandler, Response } from "express"

import { pool } from "../db"
import { TSignInUser, TSignUpUser } from "../types/user"
import { signInSchema, signUpSchema } from "../zod/zod"

export const signIn: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { email, password }: TSignInUser = req.body
		const result = signInSchema.safeParse({ email, password })
		const s = req.session as Record<string, any>

		if(result.error) {
			const err = result.error.flatten().fieldErrors

			res.status(400).json({ error: err.email?.[0] || err.password?.[0] || "Invalid Request" })
			return
		}

		const existingUser = await pool.query(`SELECT email, name, password FROM  users where email = $1`, [email])

		if(existingUser.rowCount === 0) {
			res.status(400).json({ error: "No email detected. Please sign up first." })
			return
		}

		const user: TSignInUser = existingUser.rows[0]
		const isPasswordCorrect = await bcrypt.compare(password, user.password)

		if(!isPasswordCorrect) {
			res.status(400).json({ error: "User not existing." })
			return
		}

		s.user = { success: true }

		res.status(201).json({ data: { email: user.email } })
	}
	catch(e) {
		console.log("Sign up error")
		res.status(500).json({ error: "Internal Server Error" })
	}
}

export const signUp: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { email, name, password }: TSignUpUser = req.body
		const result = signUpSchema.safeParse({ email, name, password })
		const s = req.session as Record<string, any>

		if(result.error) {
			const err = result.error.flatten().fieldErrors

			res.status(400).json({ error: err.email?.[0] || err.name?.[0] || err.password?.[0] || "Invalid Request" })
			return
		}

		const existingUser = await pool.query(`SELECT email FROM  users where email = $1`, [email])

		if(existingUser.rowCount !== 0) {
			res.status(409).json({ error: "Email is already existing." })
			return
		}

		const hashPassword = await bcrypt.hash(password, 10)

		const newUser = await pool.query(
			`INSERT INTO users (email, name, password)
			VALUES ($1, $2, $3) RETURNING email, name, password`,
			[email, name, hashPassword]
		)

		s.user = { success: true }

		res.status(201).json({ data: newUser.rows[0] })
	}
	catch(e) {
		console.log("Sign up error")
		res.status(500).json({ error: "Internal Server Error" })
	}
}
