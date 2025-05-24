import { Router } from "express"

import { sessionMiddleware } from "../middleware"
import { addMovie, getMovies } from "../controllers/movie"

const router = Router()

router.post("/movie", sessionMiddleware, addMovie)
router.get("/movies", getMovies)

export default router
