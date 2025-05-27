import { Request, Response, Router } from "express"
import { initClient } from "../lib/redis"

const router = Router()

router.get("/csrf", (req: Request, res: Response) => {
	res.cookie("XSRF-TOKEN", req.csrfToken(), {
		httpOnly: false,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production"
	});
	res.status(200).json({ message: "Token set" });
})

export default router
