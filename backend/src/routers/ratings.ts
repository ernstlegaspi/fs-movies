import { Router } from "express"
import { updateRatingScore } from "../controllers/rating"
import { sessionMiddleware } from "../middleware"

const router = Router()

router.put("/", sessionMiddleware, updateRatingScore)

export default router
