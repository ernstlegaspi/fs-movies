
import dotenv from "dotenv"
dotenv.config()

import cookieParser from "cookie-parser"
import csrf from "csurf"
import crypto from "crypto"
import express, { NextFunction, Request, Response } from "express"
import helmet from "helmet"
import pgSession from "connect-pg-simple"
import rateLimit from "express-rate-limit"
import session from "express-session"

import userRoutes from "./routers/user"
import initCSRF from "./routers/init"
import { createUserTable, dropTable, pool } from "./db"

const app = express()
const PgSession = pgSession(session)

app.use(express.json())
app.use(cookieParser())
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

app.use(csrf())

app.use((req: Request, res: Response, next: NextFunction) => {
	res.cookie("XSRF-TOKEN", req.csrfToken(), {
		httpOnly: false,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production"
	})

	next()
})

app.use(rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 5
}))

// dropTable()
createUserTable()

// const key = crypto.randomBytes(32); // 256 bits = 32 bytes
// console.log("AES-256 Key (hex):", key.toString('hex'));

app.use("/api/user", userRoutes)
app.use("/api/init", initCSRF)

const PORT = process.env.PORT || 2217
app.listen(PORT, () => console.log(`Server is running in porttt: ${PORT}`))