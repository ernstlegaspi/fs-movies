
import dotenv from "dotenv"
dotenv.config()

import crypto from "crypto"
import express from "express"
import helmet from "helmet"
import pgSession from "connect-pg-simple"
import session from "express-session"

import userRoutes from "./routers/user"
import { createUserTable, dropTable, pool } from "./db"

const app = express()
const PgSession = pgSession(session)

app.use(express.json())
app.use(helmet())

app.use(helmet.contentSecurityPolicy({
	directives: {
		defaultSrc: ["'self'"],
		imgSrc: ["'self'", "data:", "https:"],
		scriptSrc: ["'self'"],
		objectSrc: ["'none'"]
	}
}))

app.use(session({
	store: new PgSession({
		pool,
		tableName: 'session',
		createTableIfMissing: true
	}),
	secret: process.env.AUTH_SECRET!,
	resave: false,
	saveUninitialized: false,
	rolling: true,
	cookie: {
		maxAge: 1000 * 60 * 60,
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production"
	}
}))

// dropTable()
createUserTable()

// const key = crypto.randomBytes(32); // 256 bits = 32 bytes
// console.log("AES-256 Key (hex):", key.toString('hex'));

app.use("/api", userRoutes)

const PORT = process.env.PORT || 2217
app.listen(PORT, () => console.log(`Server is running in port: ${PORT}`))