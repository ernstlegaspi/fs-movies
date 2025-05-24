import { Request, Response, Router } from "express"
import { initClient } from "../lib/redis"

const router = Router()

router.get("/redis", async (req: Request, res: Response) => {
	const redisClient = await initClient()

	console.log("Setting key...");
	await redisClient.set("hello", "world");

	console.log("Getting key...");
	const result = await redisClient.get("hello");

	console.log(result)

	res.status(200).json({ message: "Not cached" })
	
	// try {
	// 	const data = await setValue(key, "my test value")
	// } catch(e) {
	// 	console.log(e)
	// }

	// const cached = await redis.get(key)
	// const cached = await redis.sendCommand(["GET", "test"]);
	// console.log(cached)

	// if(cached) {
	// 	res.status(200).json({ message: "Cached" })
	// 	return
	// }

	// await redis.set(key, "test-value-123", { expiration: { type: "EX", value: 120 } })
	// await redis.sendCommand(["SET", "test", "value", "EX", "60"]);
	// res.status(200).json({ message: "Not cached" })
})

router.get("/csrf", (req: Request, res: Response) => {
	res.cookie("XSRF-TOKEN", req.csrfToken(), {
		httpOnly: false,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production"
	});
	res.status(200).json({ message: "Token set" });
})

export default router
