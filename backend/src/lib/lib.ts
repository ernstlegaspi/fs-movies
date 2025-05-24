import rateLimit from "express-rate-limit"

export const rateLimiter = (limit: number, time: number) => rateLimit({
	windowMs: time,
	limit
})
