import { NextFunction, Request, RequestHandler, Response } from "express"

export const sessionMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
	try {
		const s = req.session as Record<string, any>

		console.log(s)

		if(!s.user || !s.user.success) {
			res.status(401).json({ message: "Unauthorized request. Please sign in first." })
			return
		}

		next()
	} catch(e) {
		console.error("Error in session middleware: ", e)
		res.status(500).json({ message: "Internal Server Error" })
	}
}