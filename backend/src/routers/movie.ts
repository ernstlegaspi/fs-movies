import { Router } from "express"

import { sessionMiddleware } from "../middleware"
import { addMovie, getMovieByTitle, getMovies, getMoviesByGenres, updateMovieById } from "../controllers/movie"

const router = Router()

router.get("/:slug", getMovieByTitle)
router.get("/", getMovies)
router.get("/all/:genres", getMoviesByGenres)

router.post("/", sessionMiddleware, addMovie)

router.put("/", sessionMiddleware, updateMovieById)

export default router
