
import dotenv from "dotenv"
dotenv.config()

import cookieParser from "cookie-parser"
import csrf from "csurf"
import express, { NextFunction, Request, Response } from "express"
import helmet from "helmet"
import session from "express-session"
import { RedisStore } from "connect-redis"

import userRoutes from "./routers/user"
import movieRoutes from "./routers/movie"
import ratingRoutes from "./routers/ratings"
import initCSRF from "./routers/init"

import { initClient } from "./lib/redis"
import { createMovieTable, createRatingsTable, createUserTable, dropTables } from "./db"
import { rateLimiter } from "./lib/lib"

(async () => {
	const app = express()
	const client = await initClient()
	
	const redisStore = new RedisStore({
		client
	})

	app.use(session({
		store: redisStore,
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

	await Promise.all([
		// dropTables()
		createUserTable(),
		createMovieTable(),
		createRatingsTable()
	])
	
	app.use("/api/user", rateLimiter(51, 15 * 60 * 1000), userRoutes)
	app.use("/api/movie", rateLimiter(51, 15 * 60 * 1000), movieRoutes)
	app.use("/api/rating", rateLimiter(51, 15 * 60 * 1000), ratingRoutes)
	app.use("/api/init", initCSRF)
	
	const PORT = process.env.PORT || 2217
	app.listen(PORT, () => console.log(`Server is running in porttt: ${PORT}`))
})()
